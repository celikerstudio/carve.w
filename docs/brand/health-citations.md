# Health Citations Documentation

> This document tracks all medical/health citations used in Carve AI for Apple App Store Guideline 1.4.1 compliance.

## Overview

Carve AI provides health and fitness tracking features including calorie calculations, macro recommendations, BMI assessment, and training guidance. All health-related calculations and recommendations are backed by peer-reviewed scientific sources.

## Citation Sources

### 1. BMR & Energy Calculations

| Citation | Source | Year | Used For |
|----------|--------|------|----------|
| **Mifflin-St Jeor** | American Journal of Clinical Nutrition | 1990 | Basal Metabolic Rate (BMR) calculation |
| **EFSA Energy Requirements** | EFSA Journal | 2013 | Daily energy intake reference values |

**Implementation:**
- `GoalsSheet.swift` - Calorie goal recommendations
- `DiaryGoalView.swift` - Daily calorie targets
- `HealthCalculationsInfoView.swift` - BMR/TDEE explanation

### 2. Macronutrient Guidelines

| Citation | Source | Year | Used For |
|----------|--------|------|----------|
| **EFSA DRV 2017** | EFSA Summary Report | 2017 | General nutrient reference values |
| **EFSA Fats 2010** | EFSA Journal | 2010 | Fat intake recommendations |
| **ISSN Protein 2017** | Journal of the International Society of Sports Nutrition | 2017 | Protein intake for active individuals |
| **ISSN Nutrient Timing 2017** | Journal of the International Society of Sports Nutrition | 2017 | Optimal nutrient timing |

**Implementation:**
- `DiaryGoalView.swift` - Macro goal display
- `NutritionCoachSheet.swift` - Nutrition advice
- `HealthCalculationsInfoView.swift` - Macro ratio explanation

### 3. Hydration

| Citation | Source | Year | Used For |
|----------|--------|------|----------|
| **ACSM Hydration 2007** | ACSM Position Stand | 2007 | Exercise hydration guidelines |
| **EFSA Water 2010** | EFSA Journal | 2010 | Daily water intake reference |

**Implementation:**
- Water tracking features
- Coach hydration tips

### 4. Training & Exercise

| Citation | Source | Year | Used For |
|----------|--------|------|----------|
| **ACSM Resistance 2009** | ACSM Position Stand | 2009 | Training frequency and progression |
| **Schoenfeld Volume 2017** | Journal of Sports Sciences | 2017 | Optimal training volume for hypertrophy |
| **Compendium MET 2011** | Medicine & Science in Sports & Exercise | 2011 | Calorie burn estimation (MET values) |

**Implementation:**
- `TrainingSheet.swift` - Training split recommendations
- `PreOnboardingWorkout.swift` - Workout calorie estimation
- `MuscleStatusSheet.swift` - Recovery recommendations
- `ExerciseDetailSheet.swift` - Exercise information
- `AnalysisSection.swift` - Workout analysis

### 5. Body Composition

| Citation | Source | Year | Used For |
|----------|--------|------|----------|
| **WHO BMI 2000** | WHO Technical Report Series 894 | 2000 | BMI classification categories |

**Implementation:**
- `OnboardingMeasurements.swift` - BMI calculation and category display

### 6. General Health

| Citation | Source | Year | Used For |
|----------|--------|------|----------|
| **WHO Healthy Diet 2020** | WHO Fact Sheets | 2020 | General healthy diet recommendations |

**Implementation:**
- General nutrition guidance
- Coach dietary tips

## Views with Citations

### Settings & Info
- **SettingsView.swift** → "How We Calculate" links to `HealthCalculationsInfoView`
- **HealthCalculationsInfoView.swift** → Full explanation with Mifflin-St Jeor citation
- **HealthProfileSettingsView.swift** → `CitationFooter` with Mifflin-St Jeor, EFSA Energy (activity factors)

### Goals & Targets
- **GoalsSheet.swift** → `CitationFooter` with EFSA Energy, Mifflin-St Jeor
- **DiaryGoalView.swift** → `CitationFooter` with EFSA Energy, Mifflin-St Jeor, EFSA DRV

### Training
- **TrainingSheet.swift** → `CitationFooter` with ACSM Resistance, Schoenfeld Volume

### Onboarding
- **OnboardingMeasurements.swift** → `CitationFooter` with WHO BMI (minimal style)
- **PreOnboardingWorkout.swift** → `CitationFooter` with Compendium MET (minimal style)
- **PreOnboardingCoach.swift** → `CitationFooter` with Compendium MET, ISSN Nutrient Timing (minimal style)

### Activity Tracking
- **QuickActivityDetailSheet.swift** → `CitationFooter` in SportIntensityInfoSheet with Compendium MET (minimal style)

### AI & Coach Features
- **HeroInsightCard.swift** → `CitationFooter` inline style (Wikipedia-style superscript)
- **CoachTipSheet.swift** → `CitationFooter` compact style
- **CoachMessagesSheet.swift** → `CitationFooter` compact/minimal style
- **NutritionCoachSheet.swift** → `CitationFooter` compact style
- **NutritionDetailView.swift** → `CitationFooter` compact style

### Workout Features
- **MuscleStatusSheet.swift** → `CitationFooter` for recovery info
- **ExerciseDetailSheet.swift** → `CitationFooter` for exercise info
- **AnalysisSection.swift** → `CitationFooter` for workout analysis

### Wiki
- **WikiArticleDetailView.swift** → `CitationFooter` expanded style (per-article citations)

## Citation Display Styles

The `CitationFooter` component supports 4 display styles:

| Style | Description | Use Case |
|-------|-------------|----------|
| **compact** | Collapsible list with "Sources (N)" header | Main content areas |
| **minimal** | Small book icon that opens sheet | Space-constrained areas |
| **inline** | Wikipedia-style superscript badge | AI-generated text |
| **expanded** | Always-visible full citation list | Detail views |

## Adding New Citations

1. Add citation to `HealthCitation.swift`:
```swift
static let newCitation = HealthCitation(
    id: "unique-id",
    title: "Full Title",
    authors: "Author et al.",
    journal: "Journal Name",
    year: 2024,
    url: URL(string: "https://doi.org/...")!,
    topics: [.relevant, .topics],
    summary: "Brief description."
)
```

2. Add to `all` array in the same file

3. Use in views:
```swift
CitationFooter(
    citations: [.newCitation],
    style: .compact
)
```

## Medical Disclaimer

All views displaying health information include access to the following disclaimer (via `CitationFooter` sheet):

> "This information is for educational purposes only and is not intended as medical advice. Always consult a healthcare professional before making changes to your diet or exercise routine."

## Compliance Checklist

- [x] All calorie calculations cite sources
- [x] BMR/TDEE formulas cite Mifflin-St Jeor
- [x] Macro recommendations cite EFSA/ISSN guidelines
- [x] BMI categories cite WHO classification
- [x] Exercise calorie estimates cite Compendium of Physical Activities
- [x] Training recommendations cite ACSM/research
- [x] Citations are "easy to find" (Settings + contextual)
- [x] Links to original sources are provided
- [x] Medical disclaimer is accessible

## References

1. Mifflin MD, et al. (1990). A new predictive equation for resting energy expenditure. Am J Clin Nutr. https://doi.org/10.1093/ajcn/51.2.241

2. EFSA Panel on Dietetic Products (2013). Scientific Opinion on Dietary Reference Values for Energy. EFSA Journal. https://efsa.europa.eu/en/efsajournal/pub/3005

3. EFSA (2017). Dietary Reference Values for Nutrients. https://efsa.europa.eu/en/topics/topic/dietary-reference-values

4. Jäger R, et al. (2017). ISSN Position Stand: Protein and Exercise. J Int Soc Sports Nutr. https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0177-8

5. Kerksick CM, et al. (2017). ISSN Position Stand: Nutrient Timing. J Int Soc Sports Nutr. https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0189-4

6. ACSM (2007). Exercise and Fluid Replacement. ACSM Position Stand. https://journals.lww.com/acsm-msse/fulltext/2007/02000

7. ACSM (2009). Progression Models in Resistance Training. ACSM Position Stand. https://journals.lww.com/acsm-msse/fulltext/2009/03000

8. Schoenfeld BJ, et al. (2017). Dose-response relationship between weekly resistance training volume and increases in muscle mass. J Sports Sci. https://doi.org/10.1080/02640414.2016.1210197

9. Ainsworth BE, et al. (2011). Compendium of Physical Activities: A Second Update. Med Sci Sports Exerc. https://doi.org/10.1249/MSS.0b013e31821ece12

10. WHO (2000). Obesity: Preventing and Managing the Global Epidemic. WHO Technical Report Series 894. https://who.int/nutrition/publications/obesity/WHO_TRS_894/en/

11. EFSA Panel on Dietetic Products (2010). Scientific Opinion on Dietary Reference Values for Water. EFSA Journal. https://efsa.europa.eu/en/efsajournal/pub/1459

12. EFSA Panel on Dietetic Products (2010). Scientific Opinion on Dietary Reference Values for Fats. EFSA Journal. https://efsa.europa.eu/en/efsajournal/pub/1461

13. WHO (2020). Healthy Diet Fact Sheet. https://who.int/news-room/fact-sheets/detail/healthy-diet
