import { Switch } from "../../components/ui/switch";

const CreateProjectDialog = ({ open, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [resources, setResources] = useState({
    enabled: true,
    cpu: '0.5',
    memory: '256Mi',
    storage: '100Mi'
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
      resources: resources
    };

    onSubmit(projectData);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setError('');
    setResources({
      enabled: true,
      cpu: '0.5',
      memory: '256Mi',
      storage: '100Mi'
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
                  checked={resources.enabled}
                  onCheckedChange={(checked) => setResources(prev => ({...prev, enabled: checked}))}
                />
              </div>

              {resources.enabled && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="flex items-center justify-between">
                      <Label>CPU</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={resources.cpu}
                          onChange={(e) => setResources(prev => ({...prev, cpu: e.target.value}))}
                          placeholder="0.5"
                          className="w-24 text-center"
                        />
                        <span className="text-sm text-gray-500">Cores</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label>Memory</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={resources.memory}
                          onChange={(e) => setResources(prev => ({...prev, memory: e.target.value}))}
                          placeholder="256Mi"
                          className="w-24 text-center"
                        />
                        <span className="text-sm text-gray-500">MB/GB</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label>Storage</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={resources.storage}
                          onChange={(e) => setResources(prev => ({...prev, storage: e.target.value}))}
                          placeholder="100Mi"
                          className="w-24 text-center"
                        />
                        <span className="text-sm text-gray-500">MB/GB</span>
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