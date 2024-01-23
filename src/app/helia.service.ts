import { Injectable } from '@angular/core';
import { createHelia, Helia } from "helia";
import { createLibp2p } from "libp2p";
import { bootstrap } from '@libp2p/bootstrap'
import { webSockets } from '@libp2p/websockets'
import { unixfs } from "@helia/unixfs";
import { IDBBlockstore } from "blockstore-idb";

@Injectable({
  providedIn: 'root'
})
export class HeliaService {
  cid: any;
  imageCid: any;
  _helia?: Helia;
  store: IDBBlockstore;

  get helia(): Helia {
    if (!this.isInitialized()) {
      throw new Error('must be initialized first');
    }
    return this._helia as Helia;
  }

  constructor() {
    this.cid = null
    this.store = new IDBBlockstore('ipfs')
    this.imageCid = localStorage.getItem('imageCid');
  }

  async init() {
    await this.store.open();
    if (this.isInitialized()) return;
    const libp2p = await createLibp2p(
      {
        transports: [
          webSockets()
        ],
        peerDiscovery: [
          bootstrap({
            list: [
              '/ip4/64.23.132.69/tcp/4001'
            ]
          })
        ]
      });
    this._helia = await createHelia(
      { blockstore: this.store, libp2p }
    )

    console.log('init done');
  }

  isInitialized() {
    return !!this._helia;
  }

  async saveText(text: string) {
    const fs = unixfs(this.helia);
    const encoder = new TextEncoder()
    const cid = await fs.addBytes(encoder.encode(text), {
      onProgress: (evt) => {
        console.info('add event', evt.type, evt.detail)
      }
    })
    console.log(cid.toString(), "this is the cid")
    this.cid = cid
  }

  async findText() {
    const fs = unixfs(this.helia);
    const decoder = new TextDecoder()
    let text = ''

    for await (const chunk of fs.cat(this.cid, {
      onProgress: (evt) => {
        console.info('cat event', evt.type, evt.detail)
      }
    })) {
      text += decoder.decode(chunk, {
        stream: true
      })
    }

    console.log('Added file contents:', text)

  }
}

// async getImage() {
//   const fs = unixfs(this.helia);
//   if (!this.imageCid) throw new Error("no imageCID");

//   const chunks: Uint8Array[] = [];
//   const thing = fs.cat(this.imageCid);
//   for await (let chunk of thing) {
//     chunks.push(chunk);
//   }
//   return new Blob(chunks);
// }

  // async saveImage(file: File) {
  //   const fs = unixfs(this.helia);

  //   const reader = new FileReader();
  //   reader.onload = async () => {
  //     const byteArray = new Uint8Array(reader.result as ArrayBuffer);

  //     this.imageCid = await fs.addBytes(byteArray);
  //     localStorage.setItem('imageCid', this.imageCid);
  //   }

  //   reader.readAsArrayBuffer(file);
  // }
  
