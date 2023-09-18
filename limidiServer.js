import express from "express";
import { networkInterfaces as _networkInterfaces } from "os";
import { Output } from 'easymidi';

const app = express();

let virtualOutput;
let baseLanUrl;

const PORT = process.env.PORT || 4848

app.listen(PORT, "0.0.0.0", () => {
    const subnetIP = findSubnetIP();
    baseLanUrl = subnetIP + ":" + PORT
    console.log(baseLanUrl)
    virtualOutput = new Output('Limidi', true);
})

app.get("/Heartbeat", (req, res) => {
    res.send("Heartbeat at: " + Date.now())
});

app.get("/MidiNote", (req, res) => {
    sendMidiNote(
        req.query.isNoteOn ?? false,
        req.query.noteNumber ?? 0,
        req.query.velocity ?? 0
    )
    res.send("MidiNote: " + Date.now() + JSON.stringify(req.query))
});

app.get("/ControlChangeInput", (req, res) => {

    sendControlChange(
        req.query.controlIndex ?? 0,
        req.query.level ?? 0,
    )
    res.send("ControlChangeInput: " + Date.now() + JSON.stringify(req.query))
});


function findSubnetIP() {
    const networkInterfaces = _networkInterfaces();
    let subnetIP = '';

    // Iterate over network interfaces to find the one that's not loopback and is IPv4
    for (const ifaceName in networkInterfaces) {
        const iface = networkInterfaces[ifaceName];
        for (const addrInfo of iface) {
            if (!addrInfo.internal && addrInfo.family === 'IPv4') {
                subnetIP = addrInfo.address;
                break;
            }
        }
        if (subnetIP) break;
    }
    return subnetIP;
}

function sendMidiNote(isNoteOn, noteNumber, velocity,) {
    virtualOutput.send(isNoteOn ? "noteon" : "noteoff", {
        note: noteNumber,
        velocity: isNoteOn ? velocity : 0,
        channel: 0
    })
}

function sendControlChange(controlIndex, level,) {
    virtualOutput.send("cc", {
        controller: controlIndex,
        value: level,
        channel: 0
    })
}
