export const formatUptime = (uptimeString) => {
    if (!uptimeString) return 'Unknown';
    
    // Handle different uptime formats
    // Format 1: "292h54m49s" or similar
    const detailedMatch = uptimeString.match(/(?:(\d+)y)?(?:(\d+)mo)?(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
    if (detailedMatch) {
        const [, years, months, days, hours, minutes, seconds] = detailedMatch;
        const parts = [];
        
        if (years && parseInt(years) > 0) parts.push(`${years}y`);
        if (months && parseInt(months) > 0) parts.push(`${months}mo`);
        if (days && parseInt(days) > 0) parts.push(`${days}d`);
        if (hours && parseInt(hours) > 0) parts.push(`${hours}h`);
        if (minutes && parseInt(minutes) > 0) parts.push(`${minutes}m`);
        if (seconds && parseInt(seconds) > 0) parts.push(`${seconds}s`);
        
        if (parts.length > 0) {
            // Return the most significant 2 units for readability
            return parts.slice(0, 2).join(' ');
        }
    }
    
    // Format 2: Simple "Xh Ym" format
    const simpleMatch = uptimeString.match(/(\d+)h(\d+)m/);
    if (simpleMatch) {
        const hours = parseInt(simpleMatch[1]);
        const minutes = parseInt(simpleMatch[2]);
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        
        if (days > 0) {
            return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
        } else {
            return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
        }
    }
    
    // Format 3: Unix timestamp or milliseconds
    if (/^\d+$/.test(uptimeString)) {
        const uptimeMs = parseInt(uptimeString);
        const uptimeSeconds = uptimeMs > 1000000000000 ? Math.floor(uptimeMs / 1000) : uptimeMs;
        return formatUptimeFromSeconds(uptimeSeconds);
    }
    
    // Fallback: return original string
    return uptimeString;
};

export const formatUptimeFromSeconds = (seconds) => {
    if (!seconds || seconds < 0) return '0s';
    
    const years = Math.floor(seconds / (365 * 24 * 3600));
    const months = Math.floor((seconds % (365 * 24 * 3600)) / (30 * 24 * 3600));
    const days = Math.floor((seconds % (30 * 24 * 3600)) / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const parts = [];
    if (years > 0) parts.push(`${years}y`);
    if (months > 0) parts.push(`${months}mo`);
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 && parts.length === 0) parts.push(`${secs}s`);
    
    // Return the most significant 2 units for readability
    return parts.slice(0, 2).join(' ') || '0s';
};

export const formatCPU = (cpuString) => {
    if (!cpuString) return '0';
    return (parseInt(cpuString.replace('n', '')) / 1_000_000_000).toFixed(2);
};

export const formatMemory = (memoryString) => {
    if (!memoryString) return '0';
    const memoryKi = parseInt(memoryString.replace('Ki', ''));
    return (memoryKi / 1024).toFixed(2);
};

export const formatStorage = (storageString) => {
    if (!storageString) return '0';
    const storage = parseInt(storageString.replace('Ki', ''));
    const gbValue = (storage * 1024) / 1_000_000_000;
    return gbValue.toFixed(2);
};

export const formatCommitHash = (hash) => {
    if (!hash) return 'N/A';
    return hash.length > 7 ? hash.substring(0, 7) : hash;
};

export const formatCommitMessage = (message) => {
    if (!message) return 'No commit message';
    return message.length > 50 ? message.substring(0, 47) + '...' : message;
};

export const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
};

// Parse CPU string (e.g., '500m', '2') to cores as float
export function parseCPU(cpu) {
    if (!cpu) return 0;
    if (typeof cpu === 'number') return cpu;
    if (cpu.endsWith('m')) return parseInt(cpu) / 1000;
    if (cpu.endsWith('n')) return parseInt(cpu) / 1_000_000_000;
    return parseFloat(cpu);
}

// Parse memory/storage string (e.g., '256Mi', '1Gi', '1000Ki') to MiB as float
export function parseMemory(mem) {
    if (!mem) return 0;
    if (typeof mem === 'number') return mem;
    if (mem.endsWith('Gi')) return parseFloat(mem) * 1024;
    if (mem.endsWith('Mi')) return parseFloat(mem);
    if (mem.endsWith('Ki')) return parseFloat(mem) / 1024;
    if (mem.endsWith('Ti')) return parseFloat(mem) * 1024 * 1024;
    return parseFloat(mem); // fallback
}

// Format memory/storage for display (returns { value, unit })
export function formatMemoryDisplay(mem) {
    const valueMi = parseMemory(mem);
    if (valueMi >= 1024) {
        return { value: (valueMi / 1024).toFixed(2), unit: 'GB' };
    }
    return { value: valueMi.toFixed(2), unit: 'MB' };
}

// Format CPU for display (returns string in cores)
export function formatCPUDisplay(cpu) {
    return parseCPU(cpu).toFixed(2);
}