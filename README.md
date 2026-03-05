# 도면 탐색 인터페이스

건설 현장의 도면, 공종, 리비전 구조를 기반으로
사용자가 원하는 정보에 빠르게 도달할 수 있도록 설계한
건설 도면 탐색 인터페이스 프로젝트입니다.

이 프로젝트는 다음을 가능하게 합니다.

- 도면 탐색
- 리비전 기반 도면 표시
- 변경 항목 탐색
- 공종 간 간섭 분석

## 1. 실행 방법

---

### 1. 패키지 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 접속
http://localhost:5173

### 3. 빌드 확인

```bash
npm run build
npm run preview
```

---

## 2. 데이터 설정

과제 규정상 실제 도면 데이터는 레포지토리에 포함하지 않았습니다.
실행하려면 제공받은 데이터를 아래 위치에 복사해야 합니다.

```bash
public/data/
```

예시 구조

```bash
public
 ├ data
 │   ├ metadata.json
 │   └ drawings
 │        ├ 01_101동_지상1층_평면도_건축.png
 │        ├ 04_101동_지상1층_평면도_구조.png
 │        └ ...
 └ data.sample
     ├ metadata.sample.json
     └ drawings
```

## 3. 기술 스택

| 영역             | 기술               |
| ---------------- | ------------------ |
| Framework        | React + TypeScript |
| Build Tool       | Vite               |
| Canvas Rendering | react-konva        |
| State Management | Redux Toolkit      |
| Styling          | Tailwind CSS       |
| Data Validation  | Zod                |

---

## 4. 주요 기능

### 4.1 도면 탐색

사용자는 다음 구조로 도면을 탐색할 수 있습니다.

```plain text
도면 → 공종 → Region → Revision
```

예시

```plain text
101동 지상1층 평면도
  ├ 건축
  ├ 구조
  │   ├ Region A
  │   └ Region B
  └ 설비
```

탐색 UI는 **DrawingSelector** 컴포넌트로 구현했습니다.

### 4.2 도면 뷰어

Konva 기반 도면 뷰어를 구현했습니다.

지원 기능

- Pan (드래그 이동)
- Zoom (확대/축소)
- 도면 자동 fit
- Polygon 영역 표시

구현 컴포넌트

```plain text
MobileViewerCard
DesktopDrawingViewer
```

### 4.3 변경 항목 탐색

리비전에 포함된 변경 항목을 ChangeSheet로 표시합니다.
사용자가 변경 항목을 클릭하면

```plain text
변경 항목 → 해당 Polygon 영역으로 이동
```

기능이 동작합니다.

### 4.4 공종 간 오버레이 (간섭 확인)

데스크탑 모드에서 여러 공종 도면을 겹쳐 볼 수 있습니다.

기능

- 공종 체크박스
- opacity 조절
- 도면 없는 공종 자동 비활성화
  좌측 패널에서 제어합니다.

### 4.5 리비전 기반 도면 표시

리비전 선택 시 해당 리비전 도면을 단독으로 표시합니다.

```plain text
REV1 → REV2 → REV3
```

선택에 따라 도면이 교체됩니다.

### 4.6 컨텍스트 정보 패널

우측 Inspector 패널에서 다음 정보를 확인할 수 있습니다.

- 현재 도면
- 공종
- 리비전
- 변경 항목 목록

---

## 5. 프로젝트 구조

```bash
src
 ├ entities
 │   └ metadata
 │       ├ model
 │       └ lib
 │
 ├ widgets
 │   ├ drawing-viewer
 │   ├ overlay-controls
 │   ├ desktop-inspector
 │   └ drawing-selector
 │
 ├ pages
 │   └ viewer
 │
 ├ shared
 │   └ lib
 │
 └ public
```

---

## 6. 주요 설계 포인트

#### Metadata → Render Layer 변환

metadata 구조를 그대로 사용하지 않고

metadata
↓
render layers
구조로 변환하여 뷰어에서 사용했습니다.

이 과정에서 다음 특수 케이스를 처리했습니다.

- region 구조
- revision polygon
- polygon 없는 공종
- imageTransform 정렬

---

#### imageTransform 정렬

공종 도면은 기준 도면 위에 정렬됩니다.

```bash
기준 도면 (건축)
  + 구조
  + 설비
  + 소방
```

Konva Group transform을 사용해 정렬했습니다.

#### 모바일 → 데스크탑 확장

처음에는 모바일 UI를 기준으로 구현하고

```plain text
Mobile Viewer
   ↓
Desktop Analysis UI
```

순서로 확장했습니다.

---

## 7. 미구현 / 향후 개선

현재 구현에서 추가 개선 가능한 부분

- 리비전 비교 모드 (REV1 vs REV2)
- 변경 영역 하이라이트
- 공종 간 충돌 자동 감지
- 도면 검색 기능

## Github 저장소 링크

```
https://github.com/Bae-chaegyeom/drawing-viewer-prototype
```
