class HardwareDetector {
    constructor() {
        this.hardwareInfo = {
            cpu: { model: '检测中...', cores: navigator.hardwareConcurrency || '未知', threads: navigator.hardwareConcurrency || '未知', baseFrequency: 'N/A', architecture: 'N/A' },
            memory: { totalGB: '检测中...', availableGB: 'N/A', type: 'N/A' },
            gpu: { model: '检测中...', vramGB: 'N/A', driver: 'N/A' },
            storage: { type: 'N/A', totalGB: 'N/A', usedGB: 'N/A' },
            system: { browser: this.detectBrowser(), platform: this.detectPlatform(), userAgent: navigator.userAgent }
        };
    }

    detectBrowser() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
        if (ua.includes('Edg')) return 'Edge';
        if (ua.includes('Opera')) return 'Opera';
        return '未知浏览器';
    }

    detectPlatform() {
        const ua = navigator.userAgent;
        if (ua.includes('Win')) return 'Windows';
        if (ua.includes('Mac')) return 'macOS';
        if (ua.includes('Linux')) return 'Linux';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iOS')) return 'iOS';
        return '未知平台';
    }

    async detectCPU() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                    if (renderer) {
                        if (renderer.includes('Apple')) {
                            this.hardwareInfo.cpu.model = 'Apple Silicon';
                        } else if (renderer.includes('Intel')) {
                            this.hardwareInfo.cpu.model = 'Intel Processor';
                        } else if (renderer.includes('AMD') || renderer.includes('Radeon')) {
                            this.hardwareInfo.cpu.model = 'AMD Processor';
                        }
                    }
                }
            }
        } catch (e) {
            console.log('CPU检测受限', e);
        }

        const ua = navigator.userAgent;
        if (ua.includes('Apple')) {
            this.hardwareInfo.cpu.model = 'Apple Silicon';
        } else if (ua.includes('Win64')) {
            this.hardwareInfo.cpu.model = '64-bit Windows Processor';
        } else {
            this.hardwareInfo.cpu.model = 'Modern Processor';
        }

        if (navigator.hardwareConcurrency) {
            this.hardwareInfo.cpu.cores = navigator.hardwareConcurrency;
            this.hardwareInfo.cpu.threads = navigator.hardwareConcurrency;
        }
    }

    async detectMemory() {
        try {
            if (navigator.deviceMemory) {
                this.hardwareInfo.memory.totalGB = navigator.deviceMemory + ' GB';
            } else {
                this.hardwareInfo.memory.totalGB = '8 GB+';
            }

            if (performance.memory) {
                const total = performance.memory.jsHeapSizeLimit;
                const used = performance.memory.usedJSHeapSize;
                const usedMB = Math.round(used / 1024 / 1024);
                const totalMB = Math.round(total / 1024 / 1024);
                this.hardwareInfo.memory.usedGB = (usedMB / 1024).toFixed(2) + ' GB';
                this.hardwareInfo.memory.availableGB = ((totalMB - usedMB) / 1024).toFixed(2) + ' GB';
            }
        } catch (e) {
            console.log('内存检测受限', e);
            this.hardwareInfo.memory.totalGB = '8 GB+';
        }
    }

    async detectGPU() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                    this.hardwareInfo.gpu.model = renderer;
                    this.hardwareInfo.gpu.driver = vendor;
                } else {
                    this.hardwareInfo.gpu.model = gl.getParameter(gl.RENDERER);
                    this.hardwareInfo.gpu.driver = gl.getParameter(gl.VENDOR);
                }
            }
        } catch (e) {
            console.log('GPU检测受限', e);
            this.hardwareInfo.gpu.model = '集成显卡/独立显卡';
        }
    }

    async detectStorage() {
        try {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                if (estimate.quota) {
                    const quotaGB = (estimate.quota / 1024 / 1024 / 1024).toFixed(1);
                    const usageGB = (estimate.usage / 1024 / 1024 / 1024).toFixed(1);
                    this.hardwareInfo.storage.totalGB = quotaGB + ' GB';
                    this.hardwareInfo.storage.usedGB = usageGB + ' GB';
                }
            }
        } catch (e) {
            console.log('存储检测受限', e);
        }
        this.hardwareInfo.storage.type = 'SSD/HDD';
    }

    async detectAll() {
        await Promise.all([
            this.detectCPU(),
            this.detectMemory(),
            this.detectGPU(),
            this.detectStorage()
        ]);
        return this.hardwareInfo;
    }

    getInfo() {
        return this.hardwareInfo;
    }
}
