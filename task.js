const spawn = require('child_process').spawn;
const bin = 'node_modules\\.bin\\';

const commands = {
    clean: 'rmdir gen',
    compile: bin + 'tsc',
    webpack: bin + 'webpack',
    server: bin + 'nodemon --watch gen/server gen/server',
    test: bin + 'mocha -g gen/**/*.test.js',
    compileWatch: bin + 'tsc -w',
    webpackWatch: bin + 'webpack -w'
};

const commanded = process.argv.slice(2);
commanded.forEach(command => {
    if(commands[command]) {
        const taskList = commands[command].split(' ');

        spawn('cmd', ['/s', '/c', ...taskList], {
            cwd: process.cwd(),
            stdio: 'inherit'
        });
    } else {
        console.error(`Unknown command ${command}`)
        process.exit(1);
    }
});
