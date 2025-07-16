export const calculateMetrics = (clusterMetrics) => {
    if (!clusterMetrics) return null;

    const cpuUsagePercentage = (
        (parseInt(clusterMetrics.cpu_usage.replace('n', ''), 10) /
            (parseInt(clusterMetrics.total_cpu, 10) * 1_000_000_000)) *
        100
    ).toFixed(2);

    const memoryUsagePercentage = (
        (parseInt(clusterMetrics.memory_usage.replace('Ki', ''), 10) /
            parseInt(clusterMetrics.total_memory.replace('Ki', ''), 10)) *
        100
    ).toFixed(2);

    const totalStorageGB = (
        (parseInt(clusterMetrics.total_storage.replace('Ki', ''), 10) * 1024) /
        1_000_000_000
    ).toFixed(2);

    return {
        cpuUsagePercentage,
        memoryUsagePercentage,
        totalStorageGB,
    };
};