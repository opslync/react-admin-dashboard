import { Switch } from "../../components/ui/switch";

const CreateProjectDialog = ({ open, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [resourceLimitsEnabled, setResourceLimitsEnabled] = useState(false);
  const [resources, setResources] = useState({
    cpu: 2,
    ram: 1024,
    storage: 1024
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    const projectData = {
      name: name.trim(),
      description: description.trim(),
      resourceLimits: resourceLimitsEnabled ? resources : null
    };

    onSubmit(projectData);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setError('');
    setResourceLimitsEnabled(false);
    setResources({
      cpu: 2,
      ram: 1024,
      storage: 1024
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Project</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <div className="space-y-6">
            <div>
              <Label>Project Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter project description"
                className="mt-1.5"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Resource limits</Label>
                  <p className="text-sm text-gray-500">
                    With resource limits, you define the maximum cluster resources available to this project
                  </p>
                </div>
                <Switch
                  checked={resourceLimitsEnabled}
                  onCheckedChange={setResourceLimitsEnabled}
                />
              </div>

              {resourceLimitsEnabled && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="flex items-center justify-between">
                      <Label>CPU</Label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-1 hover:bg-gray-200 rounded"
                          onClick={() => setResources(prev => ({...prev, cpu: Math.max(0.1, prev.cpu - 0.1)}))}
                        >
                          -
                        </button>
                        <Input
                          type="number"
                          value={resources.cpu}
                          onChange={(e) => setResources(prev => ({...prev, cpu: parseFloat(e.target.value)}))}
                          className="w-24 text-center"
                          step="0.1"
                          min="0.1"
                        />
                        <button
                          type="button"
                          className="p-1 hover:bg-gray-200 rounded"
                          onClick={() => setResources(prev => ({...prev, cpu: prev.cpu + 0.1}))}
                        >
                          +
                        </button>
                        <span className="text-sm text-gray-500">Cores</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label>RAM</Label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-1 hover:bg-gray-200 rounded"
                          onClick={() => setResources(prev => ({...prev, ram: Math.max(32, prev.ram - 32)}))}
                        >
                          -
                        </button>
                        <Input
                          type="number"
                          value={resources.ram}
                          onChange={(e) => setResources(prev => ({...prev, ram: parseInt(e.target.value)}))}
                          className="w-24 text-center"
                          step="32"
                          min="32"
                        />
                        <button
                          type="button"
                          className="p-1 hover:bg-gray-200 rounded"
                          onClick={() => setResources(prev => ({...prev, ram: prev.ram + 32}))}
                        >
                          +
                        </button>
                        <span className="text-sm text-gray-500">MB</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label>Eph. Storage</Label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="p-1 hover:bg-gray-200 rounded"
                          onClick={() => setResources(prev => ({...prev, storage: Math.max(5, prev.storage - 5)}))}
                        >
                          -
                        </button>
                        <Input
                          type="number"
                          value={resources.storage}
                          onChange={(e) => setResources(prev => ({...prev, storage: parseInt(e.target.value)}))}
                          className="w-24 text-center"
                          step="5"
                          min="5"
                        />
                        <button
                          type="button"
                          className="p-1 hover:bg-gray-200 rounded"
                          onClick={() => setResources(prev => ({...prev, storage: prev.storage + 5}))}
                        >
                          +
                        </button>
                        <span className="text-sm text-gray-500">MB</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-500 text-white">
            Create Project
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 