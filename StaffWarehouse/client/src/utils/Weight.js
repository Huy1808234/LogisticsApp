export function formatWeight(weight) {
    if (weight < 1) {
        return `${(weight * 1000).toFixed(0)} g`;
    } else if (weight < 1000) {
        return `${weight.toFixed(2)} kg`;
    } else {
        return `${(weight / 1000).toFixed(2)} tấn`;
    }
}
