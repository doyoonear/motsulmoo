# Supabase Migration 가이드

## 목차
1. [개요](#개요)
2. [초기 설정](#초기-설정)
3. [Migration 워크플로우](#migration-워크플로우)
4. [로컬-원격 DB 동기화](#로컬-원격-db-동기화)
5. [자주 사용하는 명령어](#자주-사용하는-명령어)
6. [문제 해결](#문제-해결)

---

## 개요

이 프로젝트는 Supabase CLI를 사용하여 데이터베이스 스키마를 관리합니다.
- **로컬 개발**: Docker를 통한 로컬 Supabase 환경
- **원격 배포**: 실제 Supabase 프로젝트
- **Migration**: `supabase/migrations/` 디렉토리의 SQL 파일로 관리

---

## 초기 설정

### 1. Supabase CLI 설치
```bash
brew install supabase/tap/supabase
```

### 2. 프로젝트 초기화 (이미 완료됨)
```bash
supabase init
```

### 3. 로컬 Docker 환경 시작
```bash
supabase start
```

**로컬 환경 URL:**
- API: http://127.0.0.1:54321
- Studio: http://127.0.0.1:54323
- Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres

### 4. 원격 프로젝트 연결 (이미 완료됨)
```bash
supabase link --project-ref <your-project-id>
```

---

## Migration 워크플로우

### 📝 전체 흐름

```
1. Migration 파일 생성 (로컬)
   ↓
2. SQL 작성 (로컬 파일)
   ↓
3. 로컬 DB에서 테스트
   ↓
4. 원격 DB에 적용
   ↓
5. Git 커밋 (팀원과 공유)
```

### 1️⃣ Migration 파일 생성

```bash
supabase migration new <migration_name>
```

**예시:**
```bash
supabase migration new create_recipe_table
# → supabase/migrations/20251029115659_create_recipe_table.sql 생성
```

**파일 네이밍 규칙:**
- 형식: `<timestamp>_<description>.sql`
- 타임스탬프는 자동 생성 (UTC 기준)
- description은 영어로 작성 (공백 대신 언더스코어)

### 2️⃣ SQL 작성

생성된 파일에 SQL을 작성합니다:

```sql
-- Create Recipe table
CREATE TABLE "Recipe" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  -- ... 나머지 컬럼
);

-- Create indexes
CREATE INDEX "Recipe_userId_idx" ON "Recipe"("userId");

-- Enable RLS
ALTER TABLE "Recipe" ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own recipes"
  ON "Recipe" FOR SELECT
  USING (auth.uid()::text = "userId");
```

**주의사항:**
- SQL 주석은 영어로 작성 (인코딩 문제 방지)
- RLS(Row Level Security) 정책은 필수
- 인덱스는 성능을 위해 추가

### 3️⃣ 로컬 DB에서 테스트

```bash
supabase db reset
```

**이 명령어가 하는 일:**
1. 로컬 Docker DB를 완전히 초기화
2. `supabase/migrations/` 의 모든 파일을 타임스탬프 순서대로 실행
3. 에러가 있으면 즉시 중단

**테스트 결과:**
- ✅ 성공: `Finished supabase db reset` 메시지
- ❌ 실패: SQL 에러 메시지 출력 → SQL 수정 후 다시 실행

### 4️⃣ 원격 DB에 적용

```bash
supabase db push
```

**이 명령어가 하는 일:**
1. 로컬과 원격의 migration 히스토리 비교
2. 아직 원격에 적용되지 않은 migration 파일 확인
3. 사용자에게 확인 요청
4. 원격 Supabase DB에 migration 실행

**중요:**
- 이 시점에 **실제 프로덕션 DB가 변경**됩니다!
- 로컬에서 충분히 테스트한 후 실행하세요
- 실행 전 백업을 권장합니다

### 5️⃣ Git 커밋

```bash
git add supabase/migrations/
git commit -m "Add Recipe table migration"
git push
```

**팀원이 변경사항 받기:**
```bash
git pull
supabase db reset  # 로컬 DB를 최신 migration으로 업데이트
```

---

## 로컬-원격 DB 동기화

### 🔄 원격 → 로컬 동기화

**원격 스키마를 로컬로 가져오기:**

```bash
supabase db pull
```

**이 명령어가 하는 일:**
1. 원격 Supabase DB의 현재 스키마를 덤프
2. 새로운 migration 파일 생성 (예: `20251029115626_remote_schema.sql`)
3. 원격 migration 히스토리 테이블 업데이트

**사용 시나리오:**
- 새 팀원이 합류했을 때
- Dashboard에서 직접 스키마를 변경했을 때
- 로컬 migration 파일이 없을 때

### 🚀 로컬 → 원격 동기화

```bash
supabase db push
```

**사용 시나리오:**
- 새로운 migration 파일을 원격에 배포할 때
- 로컬에서 테스트 완료한 변경사항을 프로덕션에 적용할 때

### 🔍 현재 상태 확인

**로컬 DB 상태:**
```bash
supabase status
```

**Migration 히스토리 확인:**
```bash
supabase migration list
```

**원격 DB와 비교:**
```bash
supabase db diff
```

---

## 자주 사용하는 명령어

### 개발 중

```bash
# 로컬 Supabase 시작
supabase start

# 로컬 Supabase 중지
supabase stop

# 로컬 DB 초기화 (모든 migration 재실행)
supabase db reset

# 새 migration 파일 생성
supabase migration new <name>
```

### 배포

```bash
# 원격에 migration 적용
supabase db push

# 원격 스키마 가져오기
supabase db pull

# 로컬과 원격 차이 확인
supabase db diff
```

### 디버깅

```bash
# 로컬 DB 접속
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres

# 로그 확인
supabase logs

# Migration 히스토리 복구
supabase migration repair --status applied <migration_id>
```

---

## 문제 해결

### 1. Migration 적용 실패

**문제:**
```
ERROR: relation "User" does not exist
```

**해결:**
```bash
# 원격 스키마를 먼저 가져오기
supabase db pull
# 그 다음 새 migration 생성
supabase migration new <name>
```

### 2. 로컬-원격 히스토리 불일치

**문제:**
```
The remote database's migration history does not match local files
```

**해결:**
```bash
# Migration 히스토리 복구
supabase migration repair --status applied <migration_id>
```

### 3. 인코딩 에러

**문제:**
```
ERROR: invalid byte sequence for encoding "UTF8"
```

**해결:**
- SQL 파일의 주석을 영어로 작성
- 파일 인코딩을 UTF-8로 저장

### 4. Docker 문제

**문제:**
```
Cannot connect to the Docker daemon
```

**해결:**
```bash
# Docker Desktop 실행
open -a Docker

# 또는 Docker 재시작
```

---

## Best Practices

### ✅ 권장사항

1. **항상 로컬에서 먼저 테스트**
   ```bash
   supabase db reset  # 로컬 테스트
   supabase db push   # 원격 배포
   ```

2. **Migration 파일은 수정하지 말고 새로 생성**
   - 이미 적용된 migration은 수정 X
   - 변경사항은 새 migration으로 생성

3. **의미 있는 Migration 이름 사용**
   ```bash
   # ✅ Good
   supabase migration new create_recipe_table
   supabase migration new add_recipe_image_urls

   # ❌ Bad
   supabase migration new update
   supabase migration new fix
   ```

4. **RLS 정책 필수 포함**
   ```sql
   ALTER TABLE "TableName" ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "..." ON "TableName" ...;
   ```

5. **인덱스 추가**
   ```sql
   CREATE INDEX "TableName_column_idx" ON "TableName"("column");
   ```

6. **Migration은 자주, 작게**
   - 큰 변경사항을 한 번에 하지 말고
   - 작은 단위로 나눠서 migration 생성

### ❌ 피해야 할 것

1. **원격 DB에서 직접 수정**
   - Dashboard SQL Editor 사용 금지
   - 모든 변경은 migration 파일로

2. **Migration 파일 삭제**
   - 히스토리가 깨짐
   - 팀원과 동기화 문제 발생

3. **로컬 테스트 없이 push**
   - 프로덕션 DB에 문제 발생 가능

---

## 참고 자료

- [Supabase CLI 공식 문서](https://supabase.com/docs/guides/cli)
- [Database Migrations](https://supabase.com/docs/guides/cli/managing-environments)
- [Local Development](https://supabase.com/docs/guides/cli/local-development)
