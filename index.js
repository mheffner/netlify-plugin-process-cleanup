const { exec } = require("child_process");

module.exports = {
  onEnd: async ({ inputs, utils: { build, status, cache, run, git } }) => {
    let q = "ps --no-headers -a -x -o '%p,%a' | grep -v ps | grep -v grep | grep -v bash | " +
        "grep -vw '\[build\]' || true ";

    const { stdout, stderr, exitCode } = await run(q, { shell: true, reject: false, stdout: 'pipe' });
    if (exitCode != 0) {
      build.failPlugin(`Failed to query process list: ${stderr}`);
      return;
    }

    let lines = stdout.split(/\r?\n/);

    let killed = 0;
    let msgs = [];
    for (let i = 0; i < lines.length; i++) {
      let sp = lines[i].split(',');
      if (sp.length != 2) {
        continue;
      }
      let pid = parseInt(sp[0], 10);
      let cmd = sp[1];

      // prevent a self kill and don't kill buildbot
      if (1 == pid || process.pid == pid || process.ppid == pid) {
        continue;
      }

      let msg = `Killing running process '${cmd}', PID: ${pid}, with signal ${inputs.signal}.`;
      msgs.push(msg);
      console.log(msg);

      killed++;
      try {
        process.kill(pid, inputs.signal);
      } catch (e) {
        // Don't treat as fatal, process may have exited before killed
        let errmsg = `Failed to kill PID ${pid}: ${e}`;
        console.log(errmsg);
        msgs.push(errmsg);
      }
    }

    if (killed == 0) {
      console.log("Did not find any lingering processes to terminate.");
    } else {
      status.show({
        summary: `Terminated ${killed} running processes`,
        text: msgs.join("\n")
      });
    }
  },
}
