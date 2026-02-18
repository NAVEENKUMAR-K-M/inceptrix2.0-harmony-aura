export const workerMappings = {
    "W1": "Marcus Chen",
    "W2": "Sarah Miller",
    "W3": "David Park",
    "W4": "Elena Rodriguez",
    "W5": "James Wilson",
    "W6": "Priya Patel",
    "W7": "Tom Hiddleston",
    "W8": "Lisa Wong",
    "W9": "Robert Fox",
    "W10": "Emily Zhang"
};

export const machineMappings = {
    "CONST-001": "Excavator Hub Alpha",
    "CONST-002": "Dozer Unit Delta",
    "CONST-003": "Tower Crane X1",
    "CONST-004": "Heavy Hauler 04",
    "CONST-005": "Loader Systems Beta"
};

export const getWorkerName = (id) => workerMappings[id] || id;

export const getMachineName = (id) => machineMappings[id] || id;
