class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'pc_benchmark_history';
    }

    getHistory() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('读取历史记录失败', e);
            return [];
        }
    }

    saveResult(result, hardwareInfo) {
        try {
            const history = this.getHistory();
            const record = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                date: new Date().toLocaleString('zh-CN'),
                hardwareInfo: hardwareInfo,
                ...result
            };

            history.unshift(record);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history.slice(0, 50)));
            return record;
        } catch (e) {
            console.error('保存结果失败', e);
            return null;
        }
    }

    deleteRecord(id) {
        try {
            const history = this.getHistory();
            const filtered = history.filter(r => r.id !== id);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
            return true;
        } catch (e) {
            console.error('删除记录失败', e);
            return false;
        }
    }

    clearHistory() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            return true;
        } catch (e) {
            console.error('清空历史失败', e);
            return false;
        }
    }

    getLatest() {
        const history = this.getHistory();
        return history[0] || null;
    }

    exportToJSON(record) {
        const data = JSON.stringify(record, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `benchmark_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}
