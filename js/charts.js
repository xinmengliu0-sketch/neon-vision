class ChartManager {
    constructor() {
        this.radarChart = null;
        this.comparisonChart = null;
    }

    createGradient(ctx, colors) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        colors.forEach((color, i) => {
            gradient.addColorStop(i / (colors.length - 1), color);
        });
        return gradient;
    }

    drawRadarChart(results) {
        const canvas = document.getElementById('radarChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (this.radarChart) {
            this.radarChart.destroy();
        }

        const data = {
            labels: ['CPU', '内存', 'GPU', '存储'],
            datasets: [{
                label: '性能得分',
                data: [results.scores.cpu, results.scores.memory, results.scores.gpu, results.scores.storage],
                backgroundColor: 'rgba(0, 102, 255, 0.2)',
                borderColor: 'rgba(0, 102, 255, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(0, 229, 255, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(0, 102, 255, 1)'
            }]
        };

        const config = {
            type: 'radar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#F8FAFC',
                            font: {
                                size: 14
                            }
                        }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: '#94A3B8',
                            backdropColor: 'rgba(30, 41, 59, 0.8)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        pointLabels: {
                            color: '#F8FAFC',
                            font: {
                                size: 14,
                                weight: '600'
                            }
                        }
                    }
                }
            }
        };

        this.radarChart = new Chart(ctx, config);
    }

    drawComparisonChart(records) {
        const canvas = document.getElementById('comparisonChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (this.comparisonChart) {
            this.comparisonChart.destroy();
        }

        const colors = [
            'rgba(0, 102, 255, 1)',
            'rgba(124, 58, 237, 1)',
            'rgba(236, 72, 153, 1)',
            'rgba(16, 185, 129, 1)'
        ];

        const datasets = records.map((record, i) => ({
            label: record.date,
            data: [record.scores.cpu, record.scores.memory, record.scores.gpu, record.scores.storage],
            backgroundColor: colors[i % colors.length].replace('1)', '0.2)'),
            borderColor: colors[i % colors.length],
            borderWidth: 2,
            pointBackgroundColor: colors[i % colors.length],
            pointBorderColor: '#fff'
        }));

        const data = {
            labels: ['CPU', '内存', 'GPU', '存储'],
            datasets: datasets
        };

        const config = {
            type: 'radar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#F8FAFC',
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: '#94A3B8',
                            backdropColor: 'rgba(30, 41, 59, 0.8)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        pointLabels: {
                            color: '#F8FAFC',
                            font: {
                                size: 14
                            }
                        }
                    }
                }
            }
        };

        this.comparisonChart = new Chart(ctx, config);
    }

    destroyCharts() {
        if (this.radarChart) {
            this.radarChart.destroy();
            this.radarChart = null;
        }
        if (this.comparisonChart) {
            this.comparisonChart.destroy();
            this.comparisonChart = null;
        }
    }
}
