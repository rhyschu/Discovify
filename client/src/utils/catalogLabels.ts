const labels: Record<string,string> = {"\u4e2d\u56fd": "China", "\u7f8e\u56fd": "United States", "\u97e9\u56fd": "South Korea", "\u65e5\u672c": "Japan", "\u5fb7\u56fd": "Germany", "\u82f1\u56fd": "United Kingdom"};
export const catalogLabel = (value: string) => labels[value] || value;
