package com.academicmanagement.domain;

public enum LetterGrade {
    UNSATISFACTORY("неудовлетворительно"),
    SATISFACTORY("удовлетворительно"),
    GOOD("хорошо"),
    EXCELLENT("отлично");

    private final String label;

    LetterGrade(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static LetterGrade fromScore(int totalScore) {
        if (totalScore >= 87) return EXCELLENT;
        if (totalScore >= 74) return GOOD;
        if (totalScore >= 61) return SATISFACTORY;
        return UNSATISFACTORY;
    }
}
