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

// Typically I would add the authorization token and url to an ENV file, in 
// this case I didnt to make it easier for you. 

  async addPinToPinata() {
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4NWRkNTEyNy1jZDgwLTQ4NzUtYTQyMy05ODZlNmRhZWE5MGYiLCJlbWFpbCI6ImthbGVja2hAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6Ijc0NWYwZGY2YTUwNzMyYjMzZTdlIiwic2NvcGVkS2V5U2VjcmV0IjoiYmQzZWJiNzgzNjQ4Y2E5YmE5NGRjYzU0YzY5NGZiYWUwMmNjMzIzNzEzY2VlMDg2ZDc0YTU2NjM3OTdlMjY3ZiIsImlhdCI6MTcwNjE5NzMwNX0.Qs8SmEJ-cR2MemKuDLOUzeGL4hFikrCzWG7QGreyjlw'
      },
      body: JSON.stringify({ hashToPin: this.cid.toString() })
    };
    fetch('https://api.pinata.cloud/pinning/pinByHash', options)
      .then(response => response.json())
      .then(response => console.log("Pinata data added",response))
      .catch(err => console.error(err));
  }

  async getPinata() {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4NWRkNTEyNy1jZDgwLTQ4NzUtYTQyMy05ODZlNmRhZWE5MGYiLCJlbWFpbCI6ImthbGVja2hAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6Ijc0NWYwZGY2YTUwNzMyYjMzZTdlIiwic2NvcGVkS2V5U2VjcmV0IjoiYmQzZWJiNzgzNjQ4Y2E5YmE5NGRjYzU0YzY5NGZiYWUwMmNjMzIzNzEzY2VlMDg2ZDc0YTU2NjM3OTdlMjY3ZiIsImlhdCI6MTcwNjE5NzMwNX0.Qs8SmEJ-cR2MemKuDLOUzeGL4hFikrCzWG7QGreyjlw'
      },
      
    };
    fetch('https://api.pinata.cloud/data/pinList', options)
    .then(response => response.json())
    .then(response => console.log(response))
    .catch(err => console.error(err));
  }


}



function generatePrivateKey(): string {
  return crypto.randomBytes(32).toString('hex');
}


function privateKeyToPublicKey(privateKey: string): string {
  const key = crypto.createPrivateKey(privateKey);
  return key.publicKey.export({ type: 'spki', format: 'pem' }).toString();
}


async function performCRUD() {

  const privateKey = generatePrivateKey();
  const publicKey = privateKeyToPublicKey(privateKey);

  const node = await IPFS.create();
  
  const store = new IDBBlockstore('ipfs');
  const libp2p = await createLibp2p({});
  const helia = await createHelia({ blockstore: store, libp2p });

  const ipnsNamespace = await helia.publish(publicKey);
  console.log('IPNS Namespace:', ipnsNamespace);

  const fs = unixfs(helia);
  const content = 'Hello, IPFS and IPNS!';
  const cid = await fs.addString(content);
  await helia.pin(ipnsNamespace, cid.toString());
  console.log('File added and pinned:', cid.toString());

  const fileContents = await helia.cat(cid.toString());
  console.log('File contents:', fileContents.toString());

  const updatedContent = 'Hello, Updated IPFS and IPNS!';
  const updatedCid = await fs.addString(updatedContent);
  await helia.pin(ipnsNamespace, updatedCid.toString());
  console.log('File updated and pinned:', updatedCid.toString());

  const updatedFileContents = await helia.cat(updatedCid.toString());
  console.log('Updated file contents:', updatedFileContents.toString());

  await helia.unpin(ipnsNamespace, updatedCid.toString());
  console.log('File unpinned');

  await node.stop();
}

performCRUD().catch(console.error);


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

