export const formatUptime = (uptimeString) => {
    if (!uptimeString) return 'Unknown';
    const match = uptimeString.match(/(\d+)h(\d+)m/);
    if (!match) return uptimeString;

    const hours = parseInt(match[1]);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    return `${days}d ${remainingHours}h`;
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