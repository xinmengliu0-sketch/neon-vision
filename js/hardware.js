class HardwareDetector {
    constructor() {
        this.hardwareInfo = {
            cpu: { 
                model: '检测中...', 
                cores: navigator.hardwareConcurrency || '未知', 
                threads: navigator.hardwareConcurrency || '未知',
                baseFrequency: 'N/A',
                architecture: 'N/A',
                manufacturer: 'N/A',
                cache: 'N/A'
            },
            memory: { 
                totalGB: '检测中...', 
                availableGB: 'N/A', 
                usedGB: 'N/A',
                type: 'N/A',
                speed: 'N/A'
            },
            gpu: { 
                model: '检测中...', 
                vramGB: 'N/A', 
                driver: 'N/A',
                vendor: 'N/A',
                api: 'N/A'
            },
            storage: { 
                type: 'N/A', 
                totalGB: 'N/A', 
                usedGB: 'N/A'
            },
            system: { 
                browser: this.detectBrowser(), 
                platform: this.detectPlatform(), 
                userAgent: navigator.userAgent,
                os: this.detectOS(),
                screen: this.detectScreen()
            }
        };
    }

    detectBrowser() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
        if (ua.includes('Edg')) return 'Edge';
        if (ua.includes('Opera')) return 'Opera';
        if (ua.includes('Brave')) return 'Brave';
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

    detectOS() {
        const ua = navigator.userAgent;
        let os = '未知操作系统';
        
        if (ua.includes('Win')) {
            os = 'Windows';
            if (ua.includes('Windows NT 10.0')) os = 'Windows 10/11';
            else if (ua.includes('Windows NT 6.3')) os = 'Windows 8.1';
            else if (ua.includes('Windows NT 6.2')) os = 'Windows 8';
            else if (ua.includes('Windows NT 6.1')) os = 'Windows 7';
        } else if (ua.includes('Mac')) {
            os = 'macOS';
            const versionMatch = ua.match(/Mac OS X (\d+[_.]\d+([_.]\d+)?)/);
            if (versionMatch) {
                os = 'macOS ' + versionMatch[1].replace(/_/g, '.');
            }
        } else if (ua.includes('Linux')) {
            os = 'Linux';
        } else if (ua.includes('Android')) {
            os = 'Android';
        } else if (ua.includes('iOS')) {
            os = 'iOS';
        }
        
        return os;
    }

    detectScreen() {
        return {
            width: screen.width,
            height: screen.height,
            colorDepth: screen.colorDepth,
            pixelRatio: window.devicePixelRatio || 1
        };
    }

    async detectCPU() {
        let cpuInfo = {
            model: '未知处理器',
            manufacturer: 'N/A',
            architecture: 'N/A',
            cores: navigator.hardwareConcurrency || 'N/A',
            threads: navigator.hardwareConcurrency || 'N/A'
        };

        const ua = navigator.userAgent.toLowerCase();
        
        if (ua.includes('apple') || ua.includes('macintosh')) {
            cpuInfo.manufacturer = 'Apple';
            if (ua.includes('m1')) cpuInfo.model = 'Apple M1';
            else if (ua.includes('m2')) cpuInfo.model = 'Apple M2';
            else if (ua.includes('m3')) cpuInfo.model = 'Apple M3';
            else if (ua.includes('m4')) cpuInfo.model = 'Apple M4';
            else cpuInfo.model = 'Apple Silicon';
        } else if (ua.includes('intel')) {
            cpuInfo.manufacturer = 'Intel';
            if (ua.includes('i9')) cpuInfo.model = 'Intel Core i9';
            else if (ua.includes('i7')) cpuInfo.model = 'Intel Core i7';
            else if (ua.includes('i5')) cpuInfo.model = 'Intel Core i5';
            else if (ua.includes('i3')) cpuInfo.model = 'Intel Core i3';
            else if (ua.includes('pentium')) cpuInfo.model = 'Intel Pentium';
            else if (ua.includes('celeron')) cpuInfo.model = 'Intel Celeron';
            else cpuInfo.model = 'Intel Processor';
        } else if (ua.includes('amd') || ua.includes('ryzen')) {
            cpuInfo.manufacturer = 'AMD';
            if (ua.includes('ryzen 9')) cpuInfo.model = 'AMD Ryzen 9';
            else if (ua.includes('ryzen 7')) cpuInfo.model = 'AMD Ryzen 7';
            else if (ua.includes('ryzen 5')) cpuInfo.model = 'AMD Ryzen 5';
            else if (ua.includes('ryzen 3')) cpuInfo.model = 'AMD Ryzen 3';
            else cpuInfo.model = 'AMD Processor';
        } else if (ua.includes('arm')) {
            cpuInfo.manufacturer = 'ARM';
            cpuInfo.model = 'ARM Processor';
        }

        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                    
                    if (renderer && renderer.toLowerCase().includes('apple')) {
                        if (cpuInfo.model === '未知处理器') {
                            cpuInfo.manufacturer = 'Apple';
                            cpuInfo.model = 'Apple Silicon';
                        }
                    }
                    if (vendor && vendor.toLowerCase().includes('apple')) {
                        cpuInfo.manufacturer = 'Apple';
                    }
                }
            }
        } catch (e) {
            console.log('WebGL CPU检测受限', e);
        }

        if (navigator.userAgent.includes('WOW64') || navigator.userAgent.includes('Win64')) {
            cpuInfo.architecture = 'x86-64';
        } else if (navigator.userAgent.includes('ARM64') || navigator.userAgent.includes('aarch64')) {
            cpuInfo.architecture = 'ARM64';
        } else if (navigator.userAgent.includes('ARM')) {
            cpuInfo.architecture = 'ARM';
        } else {
            cpuInfo.architecture = 'x86';
        }

        if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
            try {
                const values = await navigator.userAgentData.getHighEntropyValues(['architecture', 'bitness', 'platformVersion']);
                if (values.architecture) cpuInfo.architecture = values.architecture;
                if (values.bitness) cpuInfo.architecture += ` (${values.bitness}-bit)`;
            } catch (e) {
                console.log('High entropy API受限', e);
            }
        }

        const performanceScore = await this.benchmarkCPU();
        if (cpuInfo.model === '未知处理器') {
            if (performanceScore > 15000) cpuInfo.model = '高性能处理器';
            else if (performanceScore > 8000) cpuInfo.model = '中端处理器';
            else cpuInfo.model = '入门级处理器';
        }

        this.hardwareInfo.cpu.model = cpuInfo.model;
        this.hardwareInfo.cpu.manufacturer = cpuInfo.manufacturer;
        this.hardwareInfo.cpu.architecture = cpuInfo.architecture;
        if (cpuInfo.cores !== 'N/A') {
            this.hardwareInfo.cpu.cores = cpuInfo.cores;
            this.hardwareInfo.cpu.threads = cpuInfo.threads;
        }
    }

    async benchmarkCPU() {
        const startTime = performance.now();
        let result = 0;
        const iterations = 10000000;
        
        for (let i = 0; i < iterations; i++) {
            result += Math.sqrt(i) * Math.sin(i);
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        const score = Math.round((iterations / duration) * 100);
        
        return score;
    }

    async detectMemory() {
        let memoryInfo = {
            totalGB: 'N/A',
            availableGB: 'N/A',
            usedGB: 'N/A',
            type: 'DDR4'
        };

        try {
            if (navigator.deviceMemory) {
                memoryInfo.totalGB = navigator.deviceMemory + ' GB';
            } else {
                memoryInfo.totalGB = '8 GB+';
            }

            if (performance.memory) {
                const total = performance.memory.jsHeapSizeLimit;
                const used = performance.memory.usedJSHeapSize;
                const totalMB = Math.round(total / 1024 / 1024);
                const usedMB = Math.round(used / 1024 / 1024);
                
                memoryInfo.usedGB = (usedMB / 1024).toFixed(2) + ' GB';
                memoryInfo.availableGB = ((totalMB - usedMB) / 1024).toFixed(2) + ' GB';
            }

            if (!navigator.deviceMemory) {
                const estimate = this.estimateMemory();
                if (estimate) {
                    memoryInfo.totalGB = estimate + ' GB';
                }
            }
        } catch (e) {
            console.log('内存检测受限', e);
            memoryInfo.totalGB = '8 GB+';
        }

        this.hardwareInfo.memory = memoryInfo;
    }

    estimateMemory() {
        const ua = navigator.userAgent;
        
        if (ua.includes('16 GB') || ua.includes('16GB')) return 16;
        if (ua.includes('32 GB') || ua.includes('32GB')) return 32;
        if (ua.includes('8 GB') || ua.includes('8GB')) return 8;
        if (ua.includes('64 GB') || ua.includes('64GB')) return 64;
        
        if (navigator.deviceMemory) return navigator.deviceMemory;
        
        const cores = navigator.hardwareConcurrency || 4;
        if (cores >= 16) return 32;
        if (cores >= 8) return 16;
        if (cores >= 4) return 8;
        return 4;
    }

    async detectGPU() {
        let gpuInfo = {
            model: '未知显卡',
            vendor: 'N/A',
            driver: 'N/A',
            api: 'WebGL',
            vramGB: 'N/A'
        };

        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (gl) {
                gpuInfo.api = 'WebGL';
                
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                
                if (debugInfo) {
                    gpuInfo.model = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                    gpuInfo.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                    
                    gpuInfo.driver = gpuInfo.vendor;
                } else {
                    gpuInfo.model = gl.getParameter(gl.RENDERER);
                    gpuInfo.vendor = gl.getParameter(gl.VENDOR);
                }

                if (!gpuInfo.model || gpuInfo.model === 'unknown') {
                    gpuInfo.model = gl.getParameter(gl.RENDERER);
                }
                if (!gpuInfo.vendor || gpuInfo.vendor === 'unknown') {
                    gpuInfo.vendor = gl.getParameter(gl.VENDOR);
                }
            }

            const canvas2 = document.createElement('canvas');
            const gl2 = canvas2.getContext('webgl2');
            if (gl2) {
                gpuInfo.api = 'WebGL 2.0';
            }
        } catch (e) {
            console.log('GPU检测受限', e);
        }

        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('nvidia') || gpuInfo.model.toLowerCase().includes('nvidia')) {
            gpuInfo.vendor = 'NVIDIA';
        } else if (ua.includes('amd') || gpuInfo.model.toLowerCase().includes('amd') || gpuInfo.model.toLowerCase().includes('radeon')) {
            gpuInfo.vendor = 'AMD';
        } else if (ua.includes('intel') || gpuInfo.model.toLowerCase().includes('intel')) {
            gpuInfo.vendor = 'Intel';
        } else if (ua.includes('apple') || gpuInfo.model.toLowerCase().includes('apple')) {
            gpuInfo.vendor = 'Apple';
        }

        if (gpuInfo.model.toLowerCase().includes('apple')) {
            gpuInfo.vramGB = '集成';
        } else if (gpuInfo.model.toLowerCase().includes('4090')) {
            gpuInfo.vramGB = '24 GB';
        } else if (gpuInfo.model.toLowerCase().includes('4080')) {
            gpuInfo.vramGB = '16 GB';
        } else if (gpuInfo.model.toLowerCase().includes('4070')) {
            gpuInfo.vramGB = '8/12 GB';
        } else if (gpuInfo.model.toLowerCase().includes('3090')) {
            gpuInfo.vramGB = '24 GB';
        } else if (gpuInfo.model.toLowerCase().includes('3080')) {
            gpuInfo.vramGB = '10/12 GB';
        }

        this.hardwareInfo.gpu = gpuInfo;
    }

    async detectStorage() {
        let storageInfo = {
            type: 'SSD/HDD',
            totalGB: 'N/A',
            usedGB: 'N/A'
        };

        try {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                if (estimate.quota) {
                    const quotaGB = (estimate.quota / 1024 / 1024 / 1024).toFixed(1);
                    const usageGB = (estimate.usage / 1024 / 1024 / 1024).toFixed(1);
                    storageInfo.totalGB = quotaGB + ' GB';
                    storageInfo.usedGB = usageGB + ' GB';
                }
            }
        } catch (e) {
            console.log('存储检测受限', e);
        }

        try {
            const dbName = 'storage_test_' + Date.now();
            const db = await new Promise((resolve, reject) => {
                const request = indexedDB.open(dbName, 1);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject();
                request.onupgradeneeded = (e) => {
                    e.target.result.createObjectStore('test');
                };
            });

            db.close();
            indexedDB.deleteDatabase(dbName);

            const ua = navigator.userAgent.toLowerCase();
            if (ua.includes('ssd') || ua.includes('nvme')) {
                storageInfo.type = 'NVMe SSD';
            } else {
                storageInfo.type = 'SSD';
            }
        } catch (e) {
            storageInfo.type = 'SSD/HDD';
        }

        this.hardwareInfo.storage = storageInfo;
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
