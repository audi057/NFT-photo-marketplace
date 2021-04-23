import React, { Component } from "react";
import getWeb3, { getGanacheWeb3, Web3 } from "../../utils/getWeb3";
import ipfs from '../ipfs/ipfsApi.js'

import { Grid } from '@material-ui/core';
import { Loader, Button, Card, Input, Select, Heading, Table, Form, Field } from 'rimble-ui';
import { zeppelinSolidityHotLoaderOptions } from '../../../config/webpack';

import styles from '../../App.module.scss';

require('dotenv').config()

export default class Publish extends Component {
    constructor(props) {    
        super(props);

        this.state = {
          /////// Default state
          storageValue: 0,
          web3: null,
          accounts: null,
          route: window.location.pathname.replace("/", ""),

          /////// NFT concern
          valueNFTName: '',
          valueNFTSymbol: '',
          valuePhotoPrice: '',
          valueArtistName: '',
          valuePhotoDesc: '',
          valuePhotoCategory: 'Bitcoin',
          valuePhotoCategory: 'Bitcoin',
          valuePhotoCategory: 'Bitcoin',
          optionCategories: [
            ["Bitcoin"],
            ["Ethereum"]
          ],

          /////// Ipfs Upload
          buffer: null,
          ipfsHash: '',

          //loading
          loading: false
        };

        /////// Handle
        this.handleNFTName = this.handleNFTName.bind(this);
        this.handleNFTSymbol = this.handleNFTSymbol.bind(this);
        this.handlePhotoPrice = this.handlePhotoPrice.bind(this);
        this.handlePhotoCategory = this.handlePhotoCategory.bind(this);
        this.handlePhotoDesc = this.handlePhotoDesc.bind(this);
        this.handleArtistName = this.handleArtistName.bind(this);

        /////// Ipfs Upload
        this.captureFile = this.captureFile.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }


    ///--------------------------
    /// Handler
    ///-------------------------- 
    handleNFTName(event) {
        this.setState({ valueNFTName: event.target.value });
    }

    handleNFTSymbol(event) {
        this.setState({ valueNFTSymbol: event.target.value });
    }

    handlePhotoPrice(event) {
        this.setState({ valuePhotoPrice: event.target.value });
    }
    
    handlePhotoCategory(event) {
        this.setState({ valuePhotoCategory: event.target.value });
    }
    
    handlePhotoDesc(event) {
        this.setState({ valuePhotoDesc: event.target.value });
    }
    
    handleArtistName(event) {
        this.setState({ valueArtistName: event.target.value });
    }

    ///--------------------------
    /// Functions of ipfsUpload 
    ///-------------------------- 
    captureFile(event) {
        event.preventDefault()
        const file = event.target.files[0]
        
        const reader = new window.FileReader()
        reader.readAsArrayBuffer(file)  // Read bufffered file

        // Callback
        reader.onloadend = () => {
          this.setState({ buffer: Buffer(reader.result) })
          console.log('=== buffer ===', this.state.buffer)
        }
    }
      
    onSubmit(event) {
        const { web3, accounts, photoNFTFactory, photoNFTMarketplace, PHOTO_NFT_MARKETPLACE, valueNFTName, valueNFTSymbol, valuePhotoPrice, valuePhotoCategory, valueArtistName, valuePhotoDesc } = this.state;

        event.preventDefault()
        this.setState({loading: true});
        ipfs.files.add(this.state.buffer, (error, result) => {
          // In case of fail to upload to IPFS
          if (error) {
            console.error(error)
            return
          }

          // In case of successful to upload to IPFS
          this.setState({ ipfsHash: result[0].hash });
          console.log('=== ipfsHash ===', this.state.ipfsHash);

          const nftName = valueNFTName;
          const nftSymbol = "NFT-MARKETPLACE";  /// [Note]: All NFT's symbol are common symbol
          //const nftSymbol = valueNFTSymbol;
          const _photoPrice = valuePhotoPrice;
          const photoCategory = valuePhotoCategory;
          const photoDesc = valuePhotoDesc;
          const artistName = valueArtistName;
          console.log('=== nftName ===', nftName);
          console.log('=== nftSymbol ===', nftSymbol);
          console.log('=== _photoPrice ===', _photoPrice);
          console.log('=== photoCategory ===', photoCategory);
          console.log('=== photoDesc ===', photoDesc);
          console.log('=== artistName ===', artistName);
          this.setState({ 
            valueNFTName: '',
            valueNFTSymbol: '',
            valuePhotoPrice: '',
            valuePhotoCategory: '',
            valueArtistName: '',
            valuePhotoDesc: '',
          });

          //let PHOTO_NFT;  /// [Note]: This is a photoNFT address created
          const photoPrice = web3.utils.toWei(_photoPrice, 'ether');
          const ipfsHashOfPhoto = this.state.ipfsHash;
          const photoMeta = photoCategory+'::'+artistName+'::'+photoDesc;
          console.log('=== photoMeta ===', photoMeta);
          // photoNFTFactory.methods.createNewPhotoNFT(nftName, nftSymbol, photoPrice, ipfsHashOfPhoto).send({ from: accounts[0] })
          photoNFTFactory.methods.createNewPhotoNFT(nftName, nftSymbol, photoPrice, ipfsHashOfPhoto, photoMeta).send({ from: accounts[0] })
          .once('receipt', (receipt) => {
            console.log('=== receipt ===', receipt);

            const PHOTO_NFT = receipt.events.PhotoNFTCreated.returnValues.photoNFT;
            console.log('=== PHOTO_NFT ===', PHOTO_NFT);

            /// Get instance by using created photoNFT address
            let PhotoNFT = {};
            PhotoNFT = require("../../../../build/contracts/PhotoNFT.json"); 
            let photoNFT = new web3.eth.Contract(PhotoNFT.abi, PHOTO_NFT);
            console.log('=== photoNFT ===', photoNFT);
     
            /// Check owner of photoId==1
            const photoId = 1;  /// [Note]: PhotoID is always 1. Because each photoNFT is unique.
            photoNFT.methods.ownerOf(photoId).call().then(owner => console.log('=== owner of photoId 1 ===', owner));
            
            /// [Note]: Promise (nested-structure) is needed for executing those methods below (Or, rewrite by async/await)
            photoNFT.methods.approve(PHOTO_NFT_MARKETPLACE, photoId).send({ from: accounts[0] }).once('receipt', (receipt) => {
                /// Put on sale (by a seller who is also called as owner)
                photoNFTMarketplace.methods.openTradeWhenCreateNewPhotoNFT(PHOTO_NFT, photoId, photoPrice).send({ from: accounts[0] }).once('receipt', (receipt) => {})
            })
            .then(()=>{
              console.log("Publised it successfully");
              this.setState({loading: false});
            })
          })
        })
    }  

     
    //////////////////////////////////// 
    /// Ganache
    ////////////////////////////////////
    getGanacheAddresses = async () => {
        if (!this.ganacheProvider) {
          this.ganacheProvider = getGanacheWeb3();
        }
        if (this.ganacheProvider) {
          return await this.ganacheProvider.eth.getAccounts();
        }
        return [];
    }

    componentDidMount = async () => {
        const hotLoaderDisabled = zeppelinSolidityHotLoaderOptions.disabled;
     
        let PhotoNFTFactory = {};
        let PhotoNFTMarketplace = {};
        try {
          PhotoNFTFactory = require("../../../../build/contracts/PhotoNFTFactory.json"); // Load ABI of contract of PhotoNFTFactory
          PhotoNFTMarketplace = require("../../../../build/contracts/PhotoNFTMarketplace.json");
        } catch (e) {
          console.log(e);
        }

        try {
          const isProd = process.env.NODE_ENV === 'production';
          if (!isProd) {
            // Get network provider and web3 instance.
            const web3 = await getWeb3();
            let ganacheAccounts = [];

            try {
              ganacheAccounts = await this.getGanacheAddresses();
            } catch (e) {
              console.log('Ganache is not running');
            }

            // Use web3 to get the user's accounts.
            const accounts = await web3.eth.getAccounts();
            // Get the contract instance.
            const networkId = await web3.eth.net.getId();
            const networkType = await web3.eth.net.getNetworkType();
            const isMetaMask = web3.currentProvider.isMetaMask;
            let balance = accounts.length > 0 ? await web3.eth.getBalance(accounts[0]): web3.utils.toWei('0');
            balance = web3.utils.fromWei(balance, 'ether');

            let instancePhotoNFTFactory = null;
            let instancePhotoNFTMarketplace = null;
            let PHOTO_NFT_MARKETPLACE;
            let deployedNetwork = null;

            // Create instance of contracts
            if (PhotoNFTFactory.networks) {
              deployedNetwork = PhotoNFTFactory.networks[networkId.toString()];
              if (deployedNetwork) {
                instancePhotoNFTFactory = new web3.eth.Contract(
                  PhotoNFTFactory.abi,
                  deployedNetwork && deployedNetwork.address,
                );
                console.log('=== instancePhotoNFTFactory ===', instancePhotoNFTFactory);
              }
            }

            if (PhotoNFTMarketplace.networks) {
              deployedNetwork = PhotoNFTMarketplace.networks[networkId.toString()];
              if (deployedNetwork) {
                instancePhotoNFTMarketplace = new web3.eth.Contract(
                  PhotoNFTMarketplace.abi,
                  deployedNetwork && deployedNetwork.address,
                );
                PHOTO_NFT_MARKETPLACE = deployedNetwork.address;
                console.log('=== instancePhotoNFTMarketplace ===', instancePhotoNFTMarketplace);
                console.log('=== PHOTO_NFT_MARKETPLACE ===', PHOTO_NFT_MARKETPLACE);
              }
            }

            if (instancePhotoNFTFactory) {
                // Set web3, accounts, and contract to the state, and then proceed with an
                // example of interacting with the contract's methods.
                this.setState({ 
                    web3, 
                    ganacheAccounts, 
                    accounts, 
                    balance, 
                    networkId, 
                    networkType, 
                    hotLoaderDisabled,
                    isMetaMask, 
                    photoNFTFactory: instancePhotoNFTFactory,
                    photoNFTMarketplace: instancePhotoNFTMarketplace, 
                    PHOTO_NFT_MARKETPLACE: PHOTO_NFT_MARKETPLACE }, () => {
                      this.refreshValues(instancePhotoNFTFactory);
                      setInterval(() => {
                        this.refreshValues(instancePhotoNFTFactory);
                    }, 5000);
                });
            }
            else {
              this.setState({ web3, ganacheAccounts, accounts, balance, networkId, networkType, hotLoaderDisabled, isMetaMask });
            }
          }
        } catch (error) {
          // Catch any errors for any of the above operations.
          alert(
            `Failed to load web3, accounts, or contract. Check console for details.`,
          );
          console.error(error);
        }
    };

    componentWillUnmount() {
        if (this.interval) {
          clearInterval(this.interval);
        }
    }

    refreshValues = (instancePhotoNFTFactory) => {
        if (instancePhotoNFTFactory) {
          console.log('refreshValues of instancePhotoNFTFactory');
        }
    }

    render()  {
        return (
            <div className={styles.left}>
                <Grid container style={{ marginTop: 20 }}>
                    <Grid item xs={10}>
                        <Card width={"420px"} 
                              maxWidth={"420px"} 
                              mx={"auto"} 
                              my={5} 
                              p={20} 
                              borderColor={"#E8E8E8"} >
                            <h2>Publish and Put on Sale</h2>
                            <p>Please upload your photo and put on sale from here!</p>
                            {this.state.loading==true ?
                              <div style={{textAlign: "center"}}>Loading...</div>
                              :
                              <Form onSubmit={this.onSubmit}>
                                <Field label="Photo NFT Name">
                                    <Input
                                        type="text"
                                        width={1}
                                        placeholder="e.g) Art NFT Token"
                                        required={true}
                                        value={this.state.valueNFTName} 
                                        onChange={this.handleNFTName} 
                                    />
                                </Field> 

                                
                                <Field label="Artist Name">
                                    <Input
                                        type="text"
                                        width={1}
                                        placeholder="John Dae"
                                        required={true}
                                        value={this.state.valueArtistName} 
                                        onChange={this.handleArtistName}
                                    />
                                </Field>

                                <Field label="Photo Description">
                                    <Input
                                        type="text"
                                        width={1}
                                        placeholder="Photo Description"
                                        required={true}
                                        value={this.state.valuePhotoDesc} 
                                        onChange={this.handlePhotoDesc}
                                    />
                                </Field>
                               

                                <Field label="Photo Price (unit: ETH)">
                                    <Input
                                        type="text"
                                        width={1}
                                        placeholder="e.g) 10"
                                        required={true}
                                        value={this.state.valuePhotoPrice} 
                                        onChange={this.handlePhotoPrice}                                        
                                    />
                                </Field>

                                <Field label="Category">
                                  <Select
                                    width={1}
                                    onChange={this.handlePhotoCategory}                                        
                                    onChange={this.handlePhotoCategory}                                        
                                    onChange={this.handlePhotoCategory}                                        
                                    items={this.state.optionCategories}
                                  />
                                </Field>

                                <Field label="Photo for uploading to IPFS">
                                    <input 
                                        type='file' 
                                        onChange={this.captureFile} 
                                        required={true}
                                    />
                                </Field>

                                <Button size={'medium'} width={1} type='submit'>Upload my photo and put on sale</Button>
                              </Form>
                            }
                        </Card>
                    </Grid>

                    <Grid item xs={1}>
                    </Grid>

                    <Grid item xs={1}>
                    </Grid>
                </Grid>
            </div>
        );
    }
}
