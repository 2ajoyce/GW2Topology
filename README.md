# GW2Topology

An interactive map of the Guild Wars 2 world.

## Getting Started

### Demo

You can view the latest release at [https://2ajoyce.github.io/GW2Topology/](https://2ajoyce.github.io/GW2Topology/).

### Download

Download the latest release from the [Releases](https://github.com/2ajoyce/GW2Topology/releases) page. Extract the contents of the zip file into your project.

### Usage

1. Extract the downloaded zip file to your web server directory.
2. Open `index.html` in a web browser or serve it from a web server.

The map uses the Guild Wars 2 API to display waypoints and map data. Click on waypoint icons to copy waypoint codes to your clipboard.

## Development

This project uses [just](https://github.com/casey/just) as a command runner.

### Build

To create a zip archive of the project:

```sh
just build
```

This will generate a file named `gw2topology_YYYY-MM-DD_N.zip` in the root directory.

### CI Build

For CI environments (Linux/Bash):

```sh
just build-ci
```

## License

MIT
