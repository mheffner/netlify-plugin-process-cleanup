# netlify-plugin-process-cleanup

This is a [Netlify Build
Plugin](https://docs.netlify.com/configure-builds/build-plugins/)
that will cleanup any lingering processes after a build by sending
them a kill signal.

## Usage

Add the following to your `netlify.toml`:

```toml
[[plugins]]

package = "netlify-plugin-process-cleanup"
```

The default signal used is `SIGKILL`, to override that set the signal
input variable:

```toml
[[plugins]]

package = "netlify-plugin-process-cleanup"

  [plugins.inputs]
  signal = "SIGTERM"
```
