## 1. 데이터 분석 (metadata.json 해석)

### 전체 구조 이해

본 과제의 핵심 데이터는 `metadata.json`이며, 다음과 같은 계층 구조를 가지고 있습니다.

```
project
 └ drawings
     └ drawing
         └ disciplines
             └ regions (optional)
                 └ revisions
```

즉 도면 데이터는 다음과 같은 탐색 구조를 가집니다.

```
도면 → 공종 → Region → Revision
```

예시

```
101동 지상1층 평면도
 ├ 건축
 │   └ REV1
 ├ 구조
 │   ├ Region A
 │   │   ├ REV1
 │   │   └ REV2
 │   └ Region B
 └ 설비
```

이 구조를 통해 사용자는 특정 도면과 공종, 그리고 리비전을 선택하여 원하는 정보를 탐색할 수 있습니다.

---

### 특수 케이스 분석

metadata에는 일반적인 구조 외에도 몇 가지 특수 케이스가 존재합니다.

#### 1. Region 구조

구조 공종의 경우 다음과 같은 형태로 region이 존재합니다.

```
구조
 ├ Region A
 └ Region B
```

이 경우 revision은 region 내부에 존재합니다.

```
Region A
 ├ REV1
 └ REV2
```

따라서 revision을 찾을 때 다음 두 가지 케이스를 모두 처리해야 했습니다.

```
discipline.revisions
discipline.regions[].revisions
```

---

#### 2. Revision Polygon

일부 도면에서는 polygon 정보가 discipline이 아니라 revision에 존재합니다.

예

```
discipline
 └ revisions
     └ polygon
```

따라서 polygon을 렌더링할 때 다음 순서로 탐색했습니다.

```
revision.polygon
→ discipline.polygon
→ region.polygon
```

---

#### 3. Polygon이 없는 공종

일부 공종은 polygon이 존재하지 않습니다.

예

```
주차장 구조
```

이 경우 polygon 표시 없이 도면만 렌더링하도록 처리했습니다.

---

### 데이터 정규화 전략

metadata 구조는 탐색에는 적합하지만 렌더링에는 복잡합니다.

그래서 다음 단계를 거쳐 데이터를 정규화했습니다.

```
metadata
  ↓
navigation index
  ↓
render layers
```

#### Navigation Index

도면 탐색 UI를 위한 구조입니다.

```
drawing
 └ disciplines
     └ regions
         └ revisions
```

탐색 UI(`DrawingSelector`)는 이 데이터를 사용합니다.

---

#### Render Layers

뷰어 렌더링을 위한 평탄화된 구조입니다.

각 레이어는 다음 정보를 가집니다.

```
drawingId
disciplineId
regionKey
revisionVersion
image
polygon
imageTransform
```

이를 통해 viewer는 `selectedLayer`만 찾으면 바로 렌더링할 수 있도록 설계했습니다.

---

## 2. 접근 방식 (구현 순서)

과제는 다음 순서로 구현했습니다.

### Step 1. Metadata 분석

```
metadata.json 분석
 → navigation index 생성
 → render layers 정규화
```

데이터 구조가 복잡하기 때문에 UI 구현 전에 데이터 모델을 먼저 정리했습니다.

---

### Step 2. Mobile Viewer 구현

모바일 환경을 기준으로 기본 viewer를 구현했습니다.

구현 기능

```
- 도면 렌더링
- zoom
- pan
- polygon 표시
```

기술

```
react-konva
```

---

### Step 3. 변경 항목 탐색

리비전에 포함된 변경 사항을 표시했습니다.

```
ChangeSheet
```

기능

```
변경 항목 클릭
 → polygon 중심으로 카메라 이동
```

---

### Step 4. Desktop 분석 UI 확장

모바일 기반 UI를 데스크탑 환경으로 확장했습니다.

레이아웃

```
Overlay Controls | Viewer | Inspector
```

---

### Step 5. 공종 오버레이

여러 공종 도면을 겹쳐 볼 수 있도록 구현했습니다.

```
건축 (base)
 + 구조
 + 설비
 + 소방
```

이를 통해 공종 간 간섭을 확인할 수 있습니다.

---

### Step 6. 도면 탐색 UI

사용자가 원하는 도면을 선택할 수 있도록 탐색 UI를 추가했습니다.

```
DrawingSelector
```

선택 가능

```
도면
공종
Region
Revision
```

---

## 3. UI 설계 결정

### Layout 구조

데스크탑 환경에서는 다음 구조를 사용했습니다.

```
┌───────────────┬────────────────────────┬───────────────┐
│ Overlay Panel │        Viewer          │   Inspector   │
└───────────────┴────────────────────────┴───────────────┘
```

각 영역의 역할

| 영역            | 역할                       |
| --------------- | -------------------------- |
| OverlayControls | 공종 선택 및 오버레이 설정 |
| Viewer          | 도면 표시                  |
| Inspector       | 선택된 도면 정보 표시      |

---

### Mobile → Desktop 확장

처음에는 모바일 UI를 기준으로 구현했습니다.

이유

```
현장 사용자는 모바일 환경에서 도면을 확인하는 경우가 많음
```

이후 데스크탑 분석 기능을 추가했습니다.

```
모바일
 → 도면 확인

데스크탑
 → 분석 기능
```

---

### 오버레이 UX

공종 오버레이는 다음 UX 규칙을 적용했습니다.

```
- 공종 체크박스
- opacity slider
- 도면 없는 공종 disable
```

도면이 없는 공종을 선택할 수 없도록 하여 사용자 혼란을 줄였습니다.

---

## 4. 기술 선택

### React + TypeScript

대규모 상태 관리와 타입 안정성을 위해 선택했습니다.

---

### react-konva

도면 렌더링을 위해 Canvas 기반 라이브러리를 사용했습니다.

선택 이유

```
- 이미지 렌더링
- transform 지원
- pan / zoom 구현 용이
```

---

### Redux Toolkit

전역 상태 관리에 사용했습니다.

예

```
viewer 상태
selection 상태
```

---

### Tailwind CSS

빠른 UI 구현을 위해 사용했습니다.

장점

```
- 빠른 스타일링
- 반응형 구현 용이
```

---

## 5. imageTransform 정렬 방식

공종 도면은 기준 도면 위에 정렬됩니다.

metadata의 imageTransform을 사용했습니다.

```
{
  x
  y
  scale
  rotation
}
```

viewer에서는 Konva Group transform을 사용하여 정렬했습니다.

```
<Group
 x={offsetX + t.x}
 y={offsetY + t.y}
 scaleX={t.scale}
 scaleY={t.scale}
 rotation={deg}
>
```

---

## 6. 어려웠던 점

### 1. metadata 구조의 복잡성

region / revision / polygon 위치가 일정하지 않았습니다.

예

```
discipline.polygon
revision.polygon
region.polygon
```

이를 해결하기 위해 렌더링용 데이터를 정규화했습니다.

---

### 2. imageTransform 정렬

공종 도면을 기준 도면 위에 정확히 정렬하는 것이 어려웠습니다.

특히 다음 문제가 있었습니다.

```
anchor 기준
offset 계산
rotation 적용
```

이를 해결하기 위해 Konva Group transform을 사용했습니다.

---

### 3. 공종 도면이 없는 경우

일부 공종은 도면이 존재하지 않습니다.

UX 해결 방식

```
overlay checkbox disable
```

---

## 7. 향후 개선

현재 구현 이후 추가 개선 가능한 부분입니다.

### 리비전 비교 모드

```
REV1 vs REV2
```

Split viewer 방식으로 구현 가능

---

### 변경 영역 하이라이트

polygon 기반 변경 영역 강조

---

### 공종 간 충돌 감지

단순 오버레이가 아닌 자동 충돌 감지 기능

---

### 도면 검색

도면 이름 기반 검색 기능
