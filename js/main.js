class PerformanceApp {
    constructor() {
        this.hardwareDetector = new HardwareDetector();
        this.benchmark = new PerformanceBenchmark();
        this.storage = new StorageManager();
        this.chartManager = new ChartManager();
        
        this.hardwareInfo = null;
        this.currentResults = null;
        this.selectedTests = ['cpu', 'memory', 'gpu', 'storage'];
        this.comparisonRecords = [];
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.detectHardware();
        this.loadLatestResult();
        this.hideLoader();
    }

    setupEventListeners() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                if (page) this.navigateTo(page);
            });
        });

        document.getElementById('startAllTest').addEventListener('click', () => {
            this.selectedTests = ['cpu', 'memory', 'gpu', 'storage'];
            this.navigateTo('test');
            setTimeout(() => this.startTests(), 100);
        });

        document.querySelectorAll('.test-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const testType = e.target.dataset.test;
                if (e.target.checked) {
                    if (!this.selectedTests.includes(testType)) {
                        this.selectedTests.push(testType);
                    }
                } else {
                    this.selectedTests = this.selectedTests.filter(t => t !== testType);
                }
                this.updateTestSelection();
            });
        });

        document.getElementById('startTests').addEventListener('click', () => this.startTests());
        document.getElementById('cancelTest').addEventListener('click', () => this.cancelTests());
        document.getElementById('saveReport').addEventListener('click', () => this.exportReport());
        document.getElementById('newTest').addEventListener('click', () => this.navigateTo('test'));
        document.getElementById('clearHistory').addEventListener('click', () => this.clearHistory());
        document.getElementById('closeComparison').addEventListener('click', () => this.hideComparison());

        document.getElementById('notificationClose').addEventListener('click', () => this.hideNotification());
    }

    async detectHardware() {
        this.hardwareInfo = await this.hardwareDetector.detectAll();
        this.updateHardwareDisplay();
    }

    updateHardwareDisplay() {
        document.getElementById('cpuModel').textContent = this.hardwareInfo.cpu.model;
        document.getElementById('cpuDetail').textContent = `${this.hardwareInfo.cpu.cores} 核心 / ${this.hardwareInfo.cpu.manufacturer}`;
        
        document.getElementById('memoryTotal').textContent = this.hardwareInfo.memory.totalGB;
        document.getElementById('memoryDetail').textContent = this.hardwareInfo.memory.availableGB ? `可用 ${this.hardwareInfo.memory.availableGB}` : '';
        
        document.getElementById('gpuModel').textContent = this.hardwareInfo.gpu.model;
        document.getElementById('gpuDetail').textContent = this.hardwareInfo.gpu.vendor || '';
        
        document.getElementById('storageInfo').textContent = this.hardwareInfo.storage.totalGB || 'SSD/HDD';
        document.getElementById('storageDetail').textContent = this.hardwareInfo.storage.type || '';

        document.getElementById('hwCpuModel').textContent = this.hardwareInfo.cpu.model;
        document.getElementById('hwCpuCores').textContent = this.hardwareInfo.cpu.cores;
        document.getElementById('hwCpuThreads').textContent = this.hardwareInfo.cpu.threads;
        document.getElementById('hwCpuArch').textContent = this.hardwareInfo.cpu.architecture;

        const cpuManufacturerElement = document.getElementById('hwCpuManufacturer');
        if (cpuManufacturerElement) {
            cpuManufacturerElement.textContent = this.hardwareInfo.cpu.manufacturer;
        }

        document.getElementById('hwMemTotal').textContent = this.hardwareInfo.memory.totalGB;
        document.getElementById('hwMemAvailable').textContent = this.hardwareInfo.memory.availableGB || 'N/A';
        document.getElementById('hwMemUsed').textContent = this.hardwareInfo.memory.usedGB || 'N/A';
        document.getElementById('hwMemUsage').textContent = this.hardwareInfo.memory.type || 'N/A';

        document.getElementById('hwGpuModel').textContent = this.hardwareInfo.gpu.model;
        document.getElementById('hwGpuVram').textContent = this.hardwareInfo.gpu.vramGB;
        document.getElementById('hwGpuDriver').textContent = this.hardwareInfo.gpu.driver;
        
        const gpuVendorElement = document.getElementById('hwGpuVendor');
        if (gpuVendorElement) {
            gpuVendorElement.textContent = this.hardwareInfo.gpu.vendor;
        }

        document.getElementById('hwStorageType').textContent = this.hardwareInfo.storage.type;
        document.getElementById('hwStorageTotal').textContent = this.hardwareInfo.storage.totalGB;

        document.getElementById('hwOs').textContent = this.hardwareInfo.system.os;
        document.getElementById('hwBrowser').textContent = this.hardwareInfo.system.browser;
        document.getElementById('hwPlatform').textContent = navigator.userAgent.slice(0, 100) + '...';
    }

    updateTestSelection() {
        document.querySelectorAll('.test-option-card').forEach(card => {
            const testType = card.dataset.test;
            const checkbox = card.querySelector('.test-checkbox');
            if (this.selectedTests.includes(testType)) {
                card.classList.add('selected');
                checkbox.checked = true;
            } else {
                card.classList.remove('selected');
                checkbox.checked = false;
            }
        });
    }

    async startTests() {
        if (this.selectedTests.length === 0) {
            this.showNotification('请至少选择一项测试', 'warning');
            return;
        }

        document.getElementById('testSelection').style.display = 'none';
        document.getElementById('testProgress').style.display = 'block';

        this.benchmark.onProgress = (progress) => this.updateTestProgress(progress);
        this.benchmark.reset();

        this.resetStepStatus();

        try {
            this.currentResults = await this.benchmark.runTests(this.selectedTests);
            
            if (!this.benchmark.isCancelled) {
                this.storage.saveResult(this.currentResults, this.hardwareInfo);
                this.showReport(this.currentResults);
                this.showNotification('测试完成！', 'success');
            }
        } catch (error) {
            console.error('测试出错', error);
            this.showNotification('测试过程出错', 'error');
        }
    }

    updateTestProgress(progress) {
        document.getElementById('currentTest').textContent = progress.current;
        document.getElementById('progressPercent').textContent = Math.round(progress.progress) + '%';
        document.getElementById('progressFill').style.width = progress.progress + '%';

        const steps = ['stepCpu', 'stepMemory', 'stepGpu', 'stepStorage'];
        const testMap = { cpu: 0, memory: 1, gpu: 2, storage: 3 };
        const testOrder = this.selectedTests;

        steps.forEach((stepId, index) => {
            const stepElement = document.getElementById(stepId);
            const testType = ['cpu', 'memory', 'gpu', 'storage'][index];
            
            if (!stepElement) return;

            const testIndex = testOrder.indexOf(testType);
            if (testIndex === -1) {
                stepElement.classList.add('completed');
                stepElement.querySelector('.step-status').textContent = '跳过';
            } else if (testIndex < progress.step - 1) {
                stepElement.classList.remove('active');
                stepElement.classList.add('completed');
                stepElement.querySelector('.step-status').textContent = '完成';
            } else if (testIndex === progress.step - 1) {
                stepElement.classList.add('active');
                stepElement.classList.remove('completed');
                stepElement.querySelector('.step-status').textContent = '测试中...';
            }
        });
    }

    resetStepStatus() {
        const steps = ['stepCpu', 'stepMemory', 'stepGpu', 'stepStorage'];
        steps.forEach(stepId => {
            const stepElement = document.getElementById(stepId);
            if (stepElement) {
                stepElement.classList.remove('active', 'completed');
                stepElement.querySelector('.step-status').textContent = '等待中';
            }
        });
    }

    cancelTests() {
        this.benchmark.cancel();
        this.resetTestUI();
        this.showNotification('测试已取消', 'warning');
    }

    resetTestUI() {
        document.getElementById('testSelection').style.display = 'grid';
        document.getElementById('testProgress').style.display = 'none';
        document.getElementById('progressFill').style.width = '0%';
        this.resetStepStatus();
    }

    showReport(results) {
        this.navigateTo('report');
        document.getElementById('reportDate').textContent = new Date().toLocaleString('zh-CN');

        setTimeout(() => {
            this.animateScore('overallScore', results.scores.overall, 0, 1500);
        }, 300);

        setTimeout(() => {
            this.animateScore('cpuScore', results.scores.cpu, 0, 1000);
            this.animateScore('memoryScore', results.scores.memory, 0, 1000);
            this.animateScore('gpuScore', results.scores.gpu, 0, 1000);
            this.animateScore('storageScore', results.scores.storage, 0, 1000);

            document.getElementById('cpuScoreBar').style.width = results.scores.cpu + '%';
            document.getElementById('memoryScoreBar').style.width = results.scores.memory + '%';
            document.getElementById('gpuScoreBar').style.width = results.scores.gpu + '%';
            document.getElementById('storageScoreBar').style.width = results.scores.storage + '%';
        }, 600);

        document.getElementById('cpuSingleCore').textContent = results.details.cpu.singleCore + ' 分';
        document.getElementById('cpuMultiCore').textContent = results.details.cpu.multiCore + ' 分';
        document.getElementById('cpuOperations').textContent = results.details.cpu.operationsPerSecond.toLocaleString() + ' ops/s';

        document.getElementById('memReadSpeed').textContent = results.details.memory.readSpeed + ' MB/s';
        document.getElementById('memWriteSpeed').textContent = results.details.memory.writeSpeed + ' MB/s';
        document.getElementById('memLatency').textContent = results.details.memory.latency + ' ms';

        document.getElementById('gpuFps').textContent = results.details.gpu.fps + ' FPS';
        document.getElementById('gpuDrawCalls').textContent = results.details.gpu.drawCalls.toLocaleString();
        document.getElementById('gpuTriangles').textContent = results.details.gpu.triangles.toLocaleString();

        document.getElementById('storageRead').textContent = results.details.storage.readSpeed + ' KB/s';
        document.getElementById('storageWrite').textContent = results.details.storage.writeSpeed + ' KB/s';
        document.getElementById('storageAccess').textContent = results.details.storage.accessTime + ' ms';

        document.getElementById('scoreDescription').textContent = this.getScoreDescription(results.scores.overall);

        setTimeout(() => {
            this.chartManager.drawRadarChart(results);
        }, 800);

        this.generateRecommendations(results);
        this.updateLatestResult(results);
    }

    animateScore(elementId, target, current, duration) {
        const element = document.getElementById(elementId);
        const startTime = performance.now();
        
        const animate = (time) => {
            const elapsed = time - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const value = Math.round(target * easeOut);
            element.textContent = value;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    getScoreDescription(score) {
        if (score >= 90) return '卓越性能！您的电脑配置非常出色。';
        if (score >= 75) return '优秀性能！大部分应用和游戏都能流畅运行。';
        if (score >= 60) return '良好性能，满足日常使用需求。';
        if (score >= 40) return '性能一般，建议升级部分硬件。';
        return '建议升级硬件以获得更好的体验。';
    }

    generateRecommendations(results) {
        const recommendations = [];
        
        if (results.scores.cpu < 60) {
            recommendations.push({
                icon: '🖥️',
                title: 'CPU性能偏低',
                text: '考虑升级CPU或关闭后台程序以释放资源。'
            });
        }
        
        if (results.scores.memory < 60) {
            recommendations.push({
                icon: '💾',
                title: '内存性能有待提升',
                text: '建议增加内存容量或关闭不必要的程序。'
            });
        }
        
        if (results.scores.gpu < 60) {
            recommendations.push({
                icon: '🎮',
                title: '图形性能一般',
                text: '游戏或图形密集型应用可能会受限，考虑升级显卡。'
            });
        }
        
        if (results.scores.storage < 60) {
            recommendations.push({
                icon: '💿',
                title: '存储性能不足',
                text: '考虑升级到SSD以提升系统响应速度。'
            });
        }

        if (recommendations.length === 0) {
            recommendations.push({
                icon: '✨',
                title: '性能优秀',
                text: '您的配置非常均衡，继续保持！'
            });
        }

        const container = document.getElementById('recommendationsList');
        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item">
                <div class="recommendation-icon">${rec.icon}</div>
                <div class="recommendation-content">
                    <div class="recommendation-title">${rec.title}</div>
                    <div class="recommendation-text">${rec.text}</div>
                </div>
            </div>
        `).join('');
    }

    loadLatestResult() {
        const latest = this.storage.getLatest();
        if (latest) {
            this.updateLatestResult(latest);
        }
        this.loadHistory();
    }

    updateLatestResult(result) {
        const latestResult = document.getElementById('latestResult');
        latestResult.style.display = 'block';
        
        document.getElementById('latestTestDate').textContent = result.date || new Date().toLocaleString('zh-CN');
        document.getElementById('latestOverallScore').textContent = result.scores.overall;
        document.getElementById('latestCpuScore').style.width = result.scores.cpu + '%';
        document.getElementById('latestMemoryScore').style.width = result.scores.memory + '%';
        document.getElementById('latestGpuScore').style.width = result.scores.gpu + '%';
        document.getElementById('latestStorageScore').style.width = result.scores.storage + '%';
        document.getElementById('latestCpuScoreNum').textContent = result.scores.cpu;
        document.getElementById('latestMemoryScoreNum').textContent = result.scores.memory;
        document.getElementById('latestGpuScoreNum').textContent = result.scores.gpu;
        document.getElementById('latestStorageScoreNum').textContent = result.scores.storage;
    }

    loadHistory() {
        const history = this.storage.getHistory();
        const emptyState = document.getElementById('emptyHistory');
        const historyList = document.getElementById('historyList');

        if (history.length === 0) {
            emptyState.style.display = 'block';
            historyList.style.display = 'none';
            return;
        }

        emptyState.style.display = 'none';
        historyList.style.display = 'block';
        document.getElementById('historyCount').textContent = history.length + ' 条记录';

        const container = document.getElementById('historyItems');
        container.innerHTML = history.map((record, index) => `
            <div class="history-item">
                <div class="history-item-header">
                    <span class="history-item-date">${record.date}</span>
                    <span class="history-item-score">${record.scores.overall} 分</span>
                </div>
                <div class="history-item-scores">
                    <div class="history-score-item">
                        <span class="history-score-name">CPU</span>
                        <span class="history-score-value">${record.scores.cpu}</span>
                    </div>
                    <div class="history-score-item">
                        <span class="history-score-name">内存</span>
                        <span class="history-score-value">${record.scores.memory}</span>
                    </div>
                    <div class="history-score-item">
                        <span class="history-score-name">GPU</span>
                        <span class="history-score-value">${record.scores.gpu}</span>
                    </div>
                    <div class="history-score-item">
                        <span class="history-score-name">存储</span>
                        <span class="history-score-value">${record.scores.storage}</span>
                    </div>
                </div>
                <div class="history-item-actions">
                    <button class="btn btn-secondary btn-small" onclick="app.viewRecord('${record.id}')">查看详情</button>
                    <button class="btn btn-secondary btn-small" onclick="app.toggleCompare('${record.id}')">对比</button>
                    <button class="btn btn-danger btn-small" onclick="app.deleteRecord('${record.id}')">删除</button>
                </div>
            </div>
        `).join('');
    }

    viewRecord(id) {
        const history = this.storage.getHistory();
        const record = history.find(r => r.id === id);
        if (record) {
            this.currentResults = record;
            this.showReport(record);
        }
    }

    toggleCompare(id) {
        const index = this.comparisonRecords.findIndex(r => r.id === id);
        const history = this.storage.getHistory();
        const record = history.find(r => r.id === id);

        if (index === -1) {
            if (this.comparisonRecords.length < 4) {
                this.comparisonRecords.push(record);
                this.showNotification(`已添加 ${record.date} 到对比`, 'success');
            } else {
                this.showNotification('最多对比4条记录', 'warning');
                return;
            }
        } else {
            this.comparisonRecords.splice(index, 1);
            this.showNotification('已从对比中移除', 'success');
        }

        if (this.comparisonRecords.length >= 2) {
            this.showComparison();
        }
    }

    showComparison() {
        const comparisonView = document.getElementById('comparisonView');
        comparisonView.style.display = 'block';
        
        setTimeout(() => {
            this.chartManager.drawComparisonChart(this.comparisonRecords);
        }, 100);
    }

    hideComparison() {
        document.getElementById('comparisonView').style.display = 'none';
        this.comparisonRecords = [];
    }

    deleteRecord(id) {
        if (confirm('确定删除这条记录吗？')) {
            this.storage.deleteRecord(id);
            this.loadHistory();
            this.loadLatestResult();
            this.showNotification('记录已删除', 'success');
        }
    }

    clearHistory() {
        if (confirm('确定清空所有历史记录吗？')) {
            this.storage.clearHistory();
            this.loadHistory();
            document.getElementById('latestResult').style.display = 'none';
            this.showNotification('历史记录已清空', 'success');
        }
    }

    exportReport() {
        if (this.currentResults) {
            this.storage.exportToJSON(this.currentResults);
            this.showNotification('报告已导出', 'success');
        }
    }

    navigateTo(page) {
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active');
        });

        const target = document.getElementById(page);
        if (target) {
            target.classList.add('active');
        }

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });

        if (page === 'test') {
            this.resetTestUI();
        } else if (page === 'history') {
            this.loadHistory();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const icon = document.getElementById('notificationIcon');
        const title = document.getElementById('notificationTitle');
        const messageEl = document.getElementById('notificationMessage');

        const icons = { success: '✓', error: '✕', warning: '⚠' };
        const titles = { success: '成功', error: '错误', warning: '提示' };

        notification.className = 'notification ' + type;
        icon.textContent = icons[type];
        title.textContent = titles[type];
        messageEl.textContent = message;

        notification.classList.add('show');

        clearTimeout(this.notificationTimeout);
        this.notificationTimeout = setTimeout(() => this.hideNotification(), 3000);
    }

    hideNotification() {
        document.getElementById('notification').classList.remove('show');
    }

    hideLoader() {
        const loader = document.getElementById('loader');
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 500);
    }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new PerformanceApp();
});
