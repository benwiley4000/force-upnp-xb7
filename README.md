# force-upnp-xb7

This is a script to run on the local network of your Xfinity XB7 (also called Helix Fi 2 on Vidéotron's network), which forces UPnP to the enabled state.

It's a simple automation of the process of logging into 10.0.0.1 as the "admin" user with your password, going to the Device Discovery settings page, setting "UPnP" to enabled, and saving.

## Why

UPnP can be enabled to allow a NAS, such as Synology DS series, to configure its own port forwards.

If UPnP is switched off for some reason, the port forwards are wiped. And for some reason, the Xfinity XB7 switches the UPnP setting to off periodically, particularly when receiving a software update. That can cause services you were accessing remotely to become inaccessible. This is a known bug that hasn't been fixed after many years.

## How to setup

***Before running***, copy the file **.env.example** to a new file called **.env**, and change the password to whatever your "admin" account password is for your router. This file is ignored by git. I also suggest you ignore it for any cloud backups, so your password isn't being copied into cloud storage.

You can download the code locally and run it, or set it up in a docker container. In Synology container manager, if you copy the project to a folder under /volume1/docker and open the docker-compose.yaml file when creating a new project, it will work automatically.

The idea is to only run the container when you need to enable UPnP again. As soon as the script runs, the container stops.

Otherwise, you can just run `node force-upnp.js` file manually. NodeJS is required (this is handled by the docker setup if Docker is used).

## How to ensure this is accessible when needed

Ideally, if you're using a NAS like Synology, you have a way to access the NAS dashboard remotely other than via port forwarding. For example, Synology quickconnect. If this is the case, you should be able to login, run the container to re-enable UPnP on your router's network, re-enable port forwarding mappings, and then access whatever service you had exposed via port forwarding.
