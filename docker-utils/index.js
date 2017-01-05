var Docker = require('dockerode');

var docker = new Docker({socketPath: '/var/run/docker.sock'});

docker.run('nodetest', ['node', 'app'], process.stdout, function (err, data, container) {
  console.log('error', err);
  console.log('data',data.StatusCode);
  console.log(container);
});
