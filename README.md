# 건설 도면 탐색 인터페이스 (Drawing Explorer Prototype)

과제 README의 요구사항(도면 탐색 / 도면 표시 / 컨텍스트 인식)을 기준으로 구현한 React + TypeScript 프로토타입입니다.

## 1. 과제 요구사항 대응

### 필수 기능

- 도면 탐색: 도면 → 공종 → Region(있는 경우) → Revision 선택
- 도면 표시: 선택된 도면/리비전을 Konva 캔버스에 표시
- 컨텍스트 인식: 현재 도면/공종/리비전 정보를 헤더/인스펙터에 표시

### 시나리오 대응

- 최신 리비전 확인: Revision 선택 후 즉시 반영
- 공종 간 간섭 확인: 데스크탑 오버레이 모드 + 공종별 opacity 조절
- 변경 이력 확인: Change list(리비전 changes 기반) + 정보 카드

## 2. 실행 방법

```bash
npm install
npm run dev
```

빌드 확인:

```bash
npm run build
npm run preview
```

## 3. 데이터 설정 (중요)

과제 유의사항에 따라 실제 데이터는 레포에 포함하지 않습니다.

실행 전, 제공받은 데이터를 아래 경로에 배치하세요.

```bash
public/data/
  ├ metadata.json
  └ drawings/*
```

`.gitignore`에서 `public/data/`는 제외되어 있습니다.

## 4. 기술 스택

- React 19 + TypeScript
- Vite
- Konva / react-konva
- Redux Toolkit / react-redux
- Tailwind CSS
- Zod

## 5. 현재 구현 기능

### 5.1 Metadata 로드/검증/정규화

- `metadata.json`을 Zod로 검증
- `buildNavigationIndex`: 탐색용 구조 생성
- `buildRenderLayers`: 렌더링용 평탄 레이어 생성
- 특수 케이스 처리
  - 101동 구조 Region A/B
  - 주민공동시설 건축의 revision-level polygon/imageTransform
  - polygon 없는 공종(주차장 구조)

### 5.2 모바일 UX

- 첫 진입 시 도면 선택 바텀시트 오픈
- 뒤로가기/메뉴 버튼 클릭 시 도면 선택 바텀시트 재오픈
- 바텀시트 select는 커스텀 드롭다운(포털 + fixed 위치)로 구현
  - 브라우저별 네이티브 select 팝업 위치 이슈 회피

### 5.3 뷰어

- MobileViewerCard
  - 이미지 렌더링, zoom/pan, polygon 표시
  - 변경 항목 이동 시 polygon 영역 포커싱
- DesktopDrawingViewer
  - 단일 리비전 보기
  - 공종 오버레이 보기
  - 선택 polygon 오버레이

### 5.4 변경 항목 리스트

- `changes`가 있을 때 항목 표시
- `changes`가 비어있으면 정보 카드(INFO) 표시
- 긴 문장 줄바꿈 처리로 카드 overflow 방지

### 5.5 데스크탑 오버레이 제어

- 기준 공종 선택
- 오버레이 공종 on/off
- 공종별 opacity 슬라이더
- 기준 공종은 목록에 유지(기준 배지)

## 6. 오버레이 정합성 보정

실데이터의 공종별 산출본 편차(해상도/미세 좌표 오차) 때문에 일부 조합은 데이터 transform만으로 완벽히 맞지 않습니다.

이를 위해 `ViewerPage`에 공종별 보정 맵을 추가했습니다.

- drawingId + discipline 기준으로 `dx`, `dy`, `ds(scale delta)` 적용
- 예: `ds = 0.003`은 `+0.3%` 보정

보정 위치:

- `src/pages/viewer/ui/ViewerPage.tsx`
  - `OVERLAY_CALIBRATION`
  - `applyOverlayCalibration`

## 7. 프로젝트 구조 (Lite FSD)

```bash
src/
  app/
  pages/viewer/
  widgets/
    drawing-viewer/
    drawing-selector/
    overlay-controls/
    mobile-header/
    mobile-sheet/
    change-sheet/
    desktop-inspector/
    desktop-layout/
  entities/metadata/
    lib/
    model/
  features/
    navigation/
    compare/
    layer-toggle/
  shared/
    lib/
    ui/
```

## 8. 문서

- 설계 상세: `DESIGN.md`
