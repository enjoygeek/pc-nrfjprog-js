/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

const nrfjprog = require('../index.js');

let nRFjprog;
let device;

describe('Test nrfjprog integration', () => {
    beforeEach(() => {
        nRFjprog = new nrfjprog.nRFjprog();
    });

    describe('Generic functionality', () => {
        it('gets dll version', done => {
            const callback = (err, version) => {
                expect(err).toBeUndefined();
                expect(version).toHaveProperty('major');
                expect(version).toHaveProperty('minor');
                expect(version).toHaveProperty('revision');
                done();
            };

            nRFjprog.getDllVersion(callback);
        });

        it('finds all connected devices', done => {
            const callback = (err, connectedDevices) => {
                expect(err).toBeUndefined();
                expect(connectedDevices.length).toBeGreaterThanOrEqual(1);
                expect(connectedDevices[0]).toHaveProperty('serialNumber');
                done();
            };

            nRFjprog.getConnectedDevices(callback);
        });

        it('throws when wrong parameters are sent in', () => {
            expect(() => { nRFjprog.getDllVersion(); }).toThrowErrorMatchingSnapshot();
        });
    });

    describe('Single-device', () =>{
        beforeAll(done => {
            const callback = (err, connectedDevices) => {
                device = connectedDevices[0];
                done();
            };

            nRFjprog.getConnectedDevices(callback);
        });

        describe('Non-destructive functionality', () => {
            it('finds correct family', done => {
                const callback = (err, family) => {
                    expect(err).toBeUndefined();
                    expect(family).toBe(device.family);
                    done();
                }

                nRFjprog.getFamily(device.serialNumber, callback);
            });

            it('throws an error when device do not exist', done => {
                const callback = (err, family) => {
                    expect(err).toMatchSnapshot();
                    expect(family).toBeUndefined();
                    done();
                }

                nRFjprog.getFamily(1, callback);
            });

            it('reads from specified address', done => {
                const callback = (err, contents) => {
                    expect(err).toBeUndefined();
                    expect(contents).toBeDefined();
                    done();
                }

                nRFjprog.read(device.serialNumber, 0x0, 1, callback);
            });

            it('reads 5 bytes from specified address', done => {
                const readLength = 5;

                const callback = (err, contents) => {
                    expect(err).toBeUndefined();
                    expect(contents).toBeDefined();
                    expect(contents.length).toBe(readLength);
                    done();
                }

                nRFjprog.read(device.serialNumber, 0x0, readLength, callback);
            });

            it('reads unsigned 32 from specified address', done => {
                const callback = (err, contents) => {
                    expect(err).toBeUndefined();
                    expect(contents).toBeDefined();
                    done();
                }

                nRFjprog.readU32(device.serialNumber, 0x0, callback);
            });
        });

        describe('Destructive functionality', () => {
            it('erases the whole device', done => {
                const callback = (err) => {
                    expect(err).toBeUndefined();
                    done();
                }

                nRFjprog.erase(device.serialNumber, {}, callback);
            });

            it('reads device content', done => {
                const callback = (err) => {
                    expect(err).toBeUndefined();
                    done();
                }

                nRFjprog.readToFile(device.serialNumber, "./test.hex", { readcode: true, readuicr: true }, callback);
            });
        });
    });
});


/*
let probe = new nrfjprog.nRFjprog();
let probe2 = new nrfjprog.nRFjprog();

probe.getDllVersion((err, dllVersion) => {
    if (err) {
        console.log(err, dllVersion);
        return;
    }

    console.log(dllVersion);

    probe.GetConnectedDevices((err, connectedDevices) => {
        if (err) {
            console.log(err);
            return;
        }

        console.log(connectedDevices);
    });
});
probe2.getDllVersion((err, dllVersion) => {
    if (err) {
        console.log(2, err, dllVersion);
        return;
    }

    console.log(2, dllVersion);

    probe2.GetConnectedDevices((err, connectedDevices) => {
        if (err) {
            console.log(2, err);
            return;
        }

        console.log(2, connectedDevices);
    });
});
*/
