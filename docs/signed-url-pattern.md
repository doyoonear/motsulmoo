# Signed URL 패턴 완벽 가이드

## 목차
1. [Signed URL이란?](#signed-url이란)
2. [왜 "Signed"인가?](#왜-signed인가)
3. [토큰 검증 메커니즘](#토큰-검증-메커니즘)
4. [인증 토큰 vs Signed URL](#인증-토큰-vs-signed-url)
5. [캐싱 전략](#캐싱-전략)
6. [보안 고려사항](#보안-고려사항)

---

## Signed URL이란?

### 개요

Signed URL은 **디지털 서명이 포함된 URL**로, 시간 제한이 있는 임시 접근 권한을 제공하는 보안 패턴입니다.

### Public vs Private 비교

#### Public URL
```
https://storage.com/receipts/image.jpg
```
- ✅ 간단함
- ✅ CDN 캐싱 용이
- ❌ 누구나 접근 가능
- ❌ 민감한 데이터에 부적합

#### Signed URL (Private)
```
https://storage.com/receipts/image.jpg?
  token=abc123&
  expires=1234567890&
  signature=xyz789
```
- ✅ 인증된 사용자만 접근
- ✅ 시간 제한 (만료 시간)
- ✅ URL 변조 불가
- ✅ 민감한 데이터 보호
- ⚠️ 구현 복잡도 증가

---

## 왜 "Signed"인가?

### 디지털 서명의 개념

"Signed"는 **서버의 비밀 키로 암호화된 서명**이 포함되어 있음을 의미합니다. 마치 문서에 도장을 찍는 것처럼, URL이 **변조되지 않았음**을 보증합니다.

### 서명 생성 과정

```typescript
// 1. 서명할 데이터 준비
const dataToSign = `${filePath}:${expirationTime}`;
// 예: "receipts/image.jpg:1234567890"

// 2. HMAC-SHA256으로 서명 생성
const signature = HMAC_SHA256(dataToSign, SECRET_KEY);
// 결과: "xyz789abcdef..."

// 3. URL에 서명 첨부
const signedUrl = `${baseUrl}?expires=${expirationTime}&signature=${signature}`;
```

### 핵심 특징

1. **무결성 (Integrity)**
   - URL의 어떤 부분이라도 변조하면 서명이 무효화됨
   - 파일 경로, 만료 시간 등 변경 불가

2. **인증 (Authentication)**
   - SECRET_KEY는 서버만 보유
   - 클라이언트는 서명을 생성할 수 없음

3. **시간 제한 (Temporal)**
   - 만료 시간이 서명에 포함됨
   - 만료 후 자동으로 접근 불가

---

## 토큰 검증 메커니즘

### 요청 흐름

```
[Client]                    [Storage Server]
   |                              |
   |  GET /image.jpg?             |
   |      expires=1234567890      |
   |      signature=xyz789        |
   | ---------------------------> |
   |                              |
   |                         [검증 단계]
   |                              |
   |                    1. 만료 시간 확인
   |                    2. 서명 재계산
   |                    3. 서명 비교
   |                              |
   | <--------------------------- |
   |      이미지 데이터 또는 403    |
```

### 검증 로직 상세

```typescript
function validateSignedUrl(url: string): boolean {
  const { path, expires, signature } = parseUrl(url);

  // Step 1: 만료 시간 체크
  const now = Math.floor(Date.now() / 1000);
  if (now > expires) {
    throw new Error('URL expired');
  }

  // Step 2: 서명 재계산
  const dataToSign = `${path}:${expires}`;
  const expectedSignature = hmacSHA256(dataToSign, SECRET_KEY);

  // Step 3: 서명 비교 (타이밍 공격 방지)
  if (!constantTimeEqual(signature, expectedSignature)) {
    throw new Error('Invalid signature');
  }

  return true;
}
```

### 보안 포인트

#### 1. 상수 시간 비교 (Constant-Time Comparison)
```typescript
// ❌ 위험: 타이밍 공격에 취약
if (signature === expectedSignature) { ... }

// ✅ 안전: 항상 같은 시간 소요
if (constantTimeEqual(signature, expectedSignature)) { ... }
```

#### 2. SECRET_KEY 보호
- 환경 변수로 관리
- 절대 클라이언트에 노출 금지
- 주기적 로테이션 권장

---

## 인증 토큰 vs Signed URL

### 혼동하기 쉬운 두 가지 "토큰"

#### A. JWT 인증 토큰 (User Authentication)

**목적:** 사용자 신원 증명

```typescript
// 로그인 시 발급
const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// API 요청 시 헤더에 포함
fetch('/api/receipts', {
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
});
```

**특징:**
- 사용자 정보 포함 (user_id, email 등)
- 여러 API 요청에 재사용
- 일반적으로 긴 유효 기간 (일~주 단위)

#### B. Signed URL의 서명 (Resource Authorization)

**목적:** 특정 리소스 접근 권한 증명

```typescript
// Signed URL 생성
const signedUrl = "https://storage.com/image.jpg?signature=abc123&expires=...";

// URL만으로 접근 가능 (헤더 불필요)
<img src={signedUrl} />
```

**특징:**
- 특정 파일 하나에만 유효
- URL 자체에 권한 포함
- 짧은 유효 기간 (분~시간 단위)

### 실제 사용 흐름

```typescript
// Step 1: 사용자 인증 (JWT)
const user = await authenticateUser(jwtToken);
if (!user) {
  return res.status(401).json({ error: 'Unauthorized' });
}

// Step 2: 권한 확인
const receipt = await db.receipt.findUnique({
  where: { id: receiptId }
});

if (receipt.userId !== user.id) {
  return res.status(403).json({ error: 'Forbidden' });
}

// Step 3: Signed URL 생성 (승인된 경우만)
const signedUrl = await createSignedUrl(receipt.imagePath);

// Step 4: 클라이언트에 반환
return res.json({ signedUrl });
```

### 비교 표

| 항목 | JWT 토큰 | Signed URL |
|------|----------|-----------|
| **목적** | 사용자 신원 증명 | 리소스 접근 권한 |
| **범위** | 여러 API 엔드포인트 | 특정 파일 하나 |
| **위치** | HTTP 헤더 | URL 쿼리 파라미터 |
| **유효기간** | 길다 (일~주) | 짧다 (분~시간) |
| **재사용** | 가능 | 불가능 (만료 후) |
| **검증 주체** | API 서버 | Storage 서버 |

---

## 캐싱 전략

### 왜 캐싱이 필요한가?

#### 문제점
```typescript
// ❌ 매번 Signed URL 생성 → 비효율적
async function GalleryImage({ receiptId }) {
  // 1. DB 쿼리
  const receipt = await db.receipt.findUnique({ where: { id: receiptId } });

  // 2. Supabase API 호출
  const signedUrl = await getSignedUrl(receipt.imagePath);

  return <img src={signedUrl} />;
}
```

**문제:**
- DB 쿼리 부하
- Supabase API 호출 비용
- 응답 지연

---

### 전략 1: 서버 사이드 캐싱 (Redis)

#### 구현

```typescript
// lib/cache/signed-url.cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCachedSignedUrl(
  imagePath: string,
  expiresIn: number = 3600
): Promise<string> {
  const cacheKey = `signed-url:${imagePath}`;

  // 1. 캐시 확인
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log('Cache hit:', cacheKey);
    return cached;
  }

  // 2. Signed URL 생성
  const signedUrl = await getSignedUrl(imagePath, 'receipts', expiresIn);

  // 3. 캐시 저장 (만료 시간의 80% 동안 캐싱)
  const ttl = Math.floor(expiresIn * 0.8);
  await redis.setex(cacheKey, ttl, signedUrl);

  console.log('Cache miss, stored:', cacheKey);
  return signedUrl;
}
```

#### 장단점

**장점:**
- ✅ API 호출 횟수 대폭 감소
- ✅ 응답 속도 향상
- ✅ 여러 사용자 간 캐시 공유

**단점:**
- ⚠️ Redis 인프라 필요
- ⚠️ TTL 관리 복잡도

**적합한 상황:**
- 프로덕션 환경
- 높은 트래픽
- 다수 사용자

---

### 전략 2: 클라이언트 사이드 캐싱 (React Query)

#### 구현

```typescript
// hooks/useSignedUrl.ts
import { useQuery } from '@tanstack/react-query';

export function useSignedUrl(imagePath: string | null) {
  return useQuery({
    queryKey: ['signedUrl', imagePath],
    queryFn: async () => {
      if (!imagePath) return null;

      const response = await fetch(
        `/api/signed-url?path=${encodeURIComponent(imagePath)}`
      );

      if (!response.ok) {
        throw new Error('Failed to get signed URL');
      }

      const { signedUrl } = await response.json();
      return signedUrl;
    },
    enabled: !!imagePath,
    staleTime: 30 * 60 * 1000, // 30분
    cacheTime: 45 * 60 * 1000, // 45분
    refetchOnWindowFocus: false,
  });
}
```

#### 사용 예시

```typescript
// components/GalleryImage.tsx
function GalleryImage({ imagePath }: { imagePath: string }) {
  const { data: signedUrl, isLoading } = useSignedUrl(imagePath);

  if (isLoading) return <Skeleton />;
  if (!signedUrl) return <ImageError />;

  return <img src={signedUrl} alt="구매내역" />;
}
```

#### 장단점

**장점:**
- ✅ 구현 간단
- ✅ 네트워크 요청 최소화
- ✅ 자동 캐시 관리
- ✅ 컴포넌트 간 캐시 공유

**단점:**
- ⚠️ 브라우저마다 독립적 캐시
- ⚠️ 새로고침 시 캐시 초기화

**적합한 상황:**
- 개발 초기 단계
- 간단한 애플리케이션
- SPA (Single Page Application)

---

### 전략 3: Batch 발급

#### 구현

```typescript
// API: POST /api/signed-urls
export async function POST(request: Request) {
  const { paths } = await request.json();

  // 병렬로 Signed URL 생성
  const urls = await Promise.all(
    paths.map(async (path: string) => {
      const signedUrl = await getSignedUrl(path);
      return { path, signedUrl };
    })
  );

  // 객체로 변환
  const urlMap = Object.fromEntries(
    urls.map(({ path, signedUrl }) => [path, signedUrl])
  );

  return Response.json({ urls: urlMap });
}
```

#### 클라이언트 사용

```typescript
// hooks/useSignedUrls.ts
export function useSignedUrls(imagePaths: string[]) {
  return useQuery({
    queryKey: ['signedUrls', imagePaths],
    queryFn: async () => {
      const response = await fetch('/api/signed-urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths: imagePaths }),
      });

      const { urls } = await response.json();
      return urls;
    },
    enabled: imagePaths.length > 0,
    staleTime: 30 * 60 * 1000,
  });
}

// 컴포넌트에서 사용
function Gallery({ receipts }) {
  const imagePaths = receipts.map(r => r.imagePath);
  const { data: urls } = useSignedUrls(imagePaths);

  return (
    <div>
      {receipts.map(receipt => (
        <img
          key={receipt.id}
          src={urls?.[receipt.imagePath]}
          alt="영수증"
        />
      ))}
    </div>
  );
}
```

#### 장단점

**장점:**
- ✅ 네트워크 왕복 횟수 감소
- ✅ 갤러리/리스트 페이지 최적화
- ✅ 병렬 처리로 속도 향상

**단점:**
- ⚠️ 한 번에 많은 URL 생성 시 부하
- ⚠️ 일부만 필요해도 전체 요청

**적합한 상황:**
- 이미지 갤러리
- 리스트 페이지
- 대시보드

---

### 전략 4: Long-lived URLs + Lazy Refresh

#### 구현

```typescript
// lib/signed-url-manager.ts
const refreshSchedule = new Map<string, NodeJS.Timeout>();

export async function getSignedUrlWithRefresh(
  imagePath: string
): Promise<string> {
  // 긴 만료 시간 (24시간)
  const expiresIn = 24 * 3600;
  const signedUrl = await getSignedUrl(imagePath, 'receipts', expiresIn);

  // 만료 23시간 전에 자동 갱신 스케줄링
  const refreshTime = (expiresIn - 3600) * 1000; // 23시간

  // 기존 스케줄 취소
  if (refreshSchedule.has(imagePath)) {
    clearTimeout(refreshSchedule.get(imagePath)!);
  }

  // 새 스케줄 설정
  const timeoutId = setTimeout(async () => {
    await refreshSignedUrl(imagePath);
    refreshSchedule.delete(imagePath);
  }, refreshTime);

  refreshSchedule.set(imagePath, timeoutId);

  return signedUrl;
}

async function refreshSignedUrl(imagePath: string) {
  console.log('Refreshing signed URL:', imagePath);
  // 캐시 무효화 및 재생성
  await redis.del(`signed-url:${imagePath}`);
  await getCachedSignedUrl(imagePath);
}
```

#### 장단점

**장점:**
- ✅ 사용자 경험 향상 (끊김 없음)
- ✅ 캐시 효율 극대화
- ✅ 자동 갱신

**단점:**
- ⚠️ 보안성 약간 감소
- ⚠️ 메모리 사용 (스케줄 관리)
- ⚠️ 서버 재시작 시 스케줄 초기화

**적합한 상황:**
- 내부 도구
- 낮은 민감도 데이터
- 장시간 세션

---

### 전략 비교 요약

| 전략 | 구현 복잡도 | 성능 | 보안 | 비용 | 적합한 상황 |
|------|-----------|------|------|------|------------|
| **Redis 캐싱** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | 중간 | 프로덕션, 높은 트래픽 |
| **React Query** | ⭐ | ⭐⭐ | ⭐⭐⭐ | 낮음 | 개발 중, 간단한 앱 |
| **Batch 발급** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | 중간 | 갤러리, 리스트 |
| **Long-lived** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | 낮음 | 내부 도구 |

---

## 보안 고려사항

### 1. SECRET_KEY 관리

#### Do's ✅
```typescript
// 환경 변수로 관리
const SECRET_KEY = process.env.STORAGE_SECRET_KEY!;

// 정기적으로 로테이션
async function rotateSecretKey() {
  const newKey = generateSecureKey();
  await updateEnvironmentVariable('STORAGE_SECRET_KEY', newKey);
  await invalidateAllSignedUrls();
}
```

#### Don'ts ❌
```typescript
// ❌ 코드에 하드코딩
const SECRET_KEY = 'my-secret-123';

// ❌ 클라이언트에 노출
const response = { signedUrl, secretKey: SECRET_KEY };

// ❌ Git에 커밋
// .env 파일을 .gitignore에 추가하지 않음
```

---

### 2. 만료 시간 설정

#### 용도별 권장 시간

```typescript
// 일회성 다운로드
const DOWNLOAD_EXPIRES = 5 * 60; // 5분

// 이미지 미리보기
const PREVIEW_EXPIRES = 60 * 60; // 1시간

// 갤러리/대시보드
const GALLERY_EXPIRES = 24 * 60 * 60; // 24시간

// 내부 도구
const INTERNAL_EXPIRES = 7 * 24 * 60 * 60; // 7일
```

**원칙:**
- 민감한 데이터일수록 짧게
- 사용자 경험을 해치지 않는 선에서 최소화
- 캐싱 전략과 균형

---

### 3. HTTPS 필수

```typescript
// ❌ HTTP로 Signed URL 전송 → 중간자 공격 위험
// http://example.com/api/signed-url

// ✅ HTTPS 필수
// https://example.com/api/signed-url
```

**이유:**
- Signed URL 자체가 접근 권한
- HTTP로 전송 시 URL 탈취 가능
- HTTPS로 암호화 전송 필수

---

### 4. Rate Limiting

```typescript
// lib/rate-limit.ts
import rateLimit from 'express-rate-limit';

export const signedUrlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // IP당 최대 100개 요청
  message: 'Too many requests, please try again later.',
});

// API에 적용
app.use('/api/signed-url', signedUrlLimiter);
```

**목적:**
- URL 대량 생성 방지
- 서비스 남용 차단
- 비용 절감

---

### 5. 접근 로깅

```typescript
// lib/audit-log.ts
export async function logSignedUrlAccess(params: {
  userId: string;
  filePath: string;
  action: 'created' | 'accessed' | 'failed';
  ipAddress: string;
}) {
  await db.auditLog.create({
    data: {
      ...params,
      timestamp: new Date(),
    },
  });
}

// 사용 예시
const signedUrl = await getSignedUrl(imagePath);
await logSignedUrlAccess({
  userId: user.id,
  filePath: imagePath,
  action: 'created',
  ipAddress: request.ip,
});
```

**목적:**
- 비정상 접근 탐지
- 규정 준수 (GDPR 등)
- 보안 감사

---

## 실전 예제

### Supabase + Next.js 통합

#### 1. Signed URL 생성 API

```typescript
// app/api/signed-url/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSignedUrl } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const path = request.nextUrl.searchParams.get('path');

    if (!path) {
      return NextResponse.json(
        { error: 'Path parameter required' },
        { status: 400 }
      );
    }

    // TODO: 사용자 인증 및 권한 확인

    const signedUrl = await getSignedUrl(path, 'receipts', 3600);

    return NextResponse.json({ signedUrl });
  } catch (error) {
    console.error('Error creating signed URL:', error);
    return NextResponse.json(
      { error: 'Failed to create signed URL' },
      { status: 500 }
    );
  }
}
```

#### 2. 컴포넌트에서 사용

```typescript
// components/ReceiptImage.tsx
'use client';

import { useSignedUrl } from '@/hooks/useSignedUrl';

export function ReceiptImage({ imagePath }: { imagePath: string }) {
  const { data: signedUrl, isLoading, error } = useSignedUrl(imagePath);

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-64 w-full" />;
  }

  if (error) {
    return <div className="text-red-500">이미지 로드 실패</div>;
  }

  return (
    <img
      src={signedUrl}
      alt="구매내역"
      className="w-full h-auto rounded-lg"
    />
  );
}
```

---

## 참고 자료

### 관련 기술

- **HMAC (Hash-based Message Authentication Code)**: RFC 2104
- **JWT (JSON Web Tokens)**: RFC 7519
- **AWS S3 Presigned URLs**: [AWS Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- **Supabase Storage**: [Supabase Docs](https://supabase.com/docs/guides/storage)

### 추가 학습 자료

- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [Google Cloud Storage Signed URLs](https://cloud.google.com/storage/docs/access-control/signed-urls)
- [Azure Blob Storage SAS](https://docs.microsoft.com/en-us/azure/storage/common/storage-sas-overview)

---

**작성일:** 2025-10-21
**최종 수정:** 2025-10-21
**버전:** 1.0
