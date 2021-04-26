import React, { Component } from "react";
import getWeb3, { getGanacheWeb3, Web3 } from "../../utils/getWeb3";

import { Loader, Button, Card, Input, Select, Table, Form, Field, Image } from 'rimble-ui';
import { zeppelinSolidityHotLoaderOptions } from '../../../config/webpack';

import styles from '../../App.module.scss';

require('dotenv').config()

export default class PhotoMarketplace extends Component {
    constructor(props) {
        super(props);

        this.state = {
          /////// Default state
          storageValue: 0,
          web3: null,
          accounts: null,
          currentAccount: null,          
          route: window.location.pathname.replace("/", ""),

          /////// NFT
          allPhotos: [],

          valuePhotoCategory: 'All',
          optionCategories: [
            ["All"],
            ["Bitcoin"],
            ["Ethereum"]
          ],
          searchWord:''
        };

        //this.handlePhotoNFTAddress = this.handlePhotoNFTAddress.bind(this);

        this.buyPhotoNFT = this.buyPhotoNFT.bind(this);
        this.addReputation = this.addReputation.bind(this);
    }

    ///--------------------------
    /// Handler
    ///-------------------------- 
    // handlePhotoNFTAddress(event) {
    //     this.setState({ valuePhotoNFTAddress: event.target.value });
    // }


    ///---------------------------------
    /// Functions of buying a photo NFT 
    ///---------------------------------
    buyPhotoNFT = async (address) => {
        const { web3, accounts, photoNFTMarketplace, photoNFTData } = this.state;
        //const { web3, accounts, photoNFTMarketplace, photoNFTData, valuePhotoNFTAddress } = this.state;

        console.log('=== value of buyPhotoNFT ===', address);

        const PHOTO_NFT = address;
        //const PHOTO_NFT = valuePhotoNFTAddress;
        //this.setState({ valuePhotoNFTAddress: "" });

        /// Get instance by using created photoNFT address
        let PhotoNFT = {};
        PhotoNFT = require("../../../../build/contracts/PhotoNFT.json"); 
        let photoNFT = new web3.eth.Contract(PhotoNFT.abi, PHOTO_NFT);

        /// Check owner of photoId
        const photoId = 1;  /// [Note]: PhotoID is always 1. Because each photoNFT is unique.
        const owner = await photoNFT.methods.ownerOf(photoId).call();
        console.log('=== owner of photoId ===', owner);  /// [Expect]: Owner should be the PhotoNFTMarketplace.sol (This also called as a proxy/escrow contract)

        const photo = await photoNFTData.methods.getPhotoByNFTAddress(PHOTO_NFT).call();
        const photoPrice = await photo.photoPrice;
        const buyAmount = (photoPrice/100)*102.5;
        console.log("========== photo.photoPrice", buyAmount);
        try{
          const txReceipt1 = await photoNFTMarketplace.methods.buyPhotoNFT(PHOTO_NFT).send({ from: accounts[0], value: buyAmount });
          // const txReceipt1 = await photoNFTMarketplace.methods.buyPhotoNFT(PHOTO_NFT).send({ from: accounts[0], value: buyAmount});  
        }
        catch(e){
          console.log(e);
        }
        // const txReceipt1 = await photoNFTMarketplace.methods.buyPhotoNFT(PHOTO_NFT).send({ from: accounts[0], value: buyAmount });
        // console.log('=== response of buyPhotoNFT ===', txReceipt1);
    }


    ///--------------------------
    /// Functions of reputation 
    ///---------------------------
    addReputation = async () => {
        const { accounts, photoNFTMarketplace } = this.state;

        let _from2 = "0x2cb2418B11B66E331fFaC7FFB0463d91ef8FE8F5"
        let _to2 = accounts[0]
        let _tokenId2 = 1
        const response_1 = await photoNFTMarketplace.methods.reputation(_from2, _to2, _tokenId2).send({ from: accounts[0] })
        console.log('=== response of reputation function ===', response_1);      // Debug

        const response_2 = await photoNFTMarketplace.methods.getReputationCount(_tokenId2).call()
        console.log('=== response of getReputationCount function ===', response_2);      // Debug
    }


    ///------------------------------------- 
    /// NFT（Always load listed NFT data）
    ///-------------------------------------
    getAllPhotos = async () => {
        const { photoNFTData } = this.state

        const allPhotos = await photoNFTData.methods.getAllPhotos().call()
        console.log('=== allPhotos ===', allPhotos)

        this.setState({ allPhotos: allPhotos })
        return allPhotos
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
     
        let PhotoNFTMarketplace = {};
        let PhotoNFTData = {};
        try {
          PhotoNFTMarketplace = require("../../../../build/contracts/PhotoNFTMarketplace.json");
          PhotoNFTData = require("../../../../build/contracts/PhotoNFTData.json");
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
            const currentAccount = accounts[0];
            // Get the contract instance.
            const networkId = await web3.eth.net.getId();
            const networkType = await web3.eth.net.getNetworkType();
            const isMetaMask = web3.currentProvider.isMetaMask;
            let balance = accounts.length > 0 ? await web3.eth.getBalance(accounts[0]): web3.utils.toWei('0');
            balance = web3.utils.fromWei(balance, 'ether');

            let instancePhotoNFTMarketplace = null;
            let instancePhotoNFTData = null;
            let deployedNetwork = null;

            // Create instance of contracts
            if (PhotoNFTMarketplace.networks) {
              deployedNetwork = PhotoNFTMarketplace.networks[networkId.toString()];
              if (deployedNetwork) {
                instancePhotoNFTMarketplace = new web3.eth.Contract(
                  PhotoNFTMarketplace.abi,
                  deployedNetwork && deployedNetwork.address,
                );
                console.log('=== instancePhotoNFTMarketplace ===', instancePhotoNFTMarketplace);
              }
            }

            if (PhotoNFTData.networks) {
              deployedNetwork = PhotoNFTData.networks[networkId.toString()];
              if (deployedNetwork) {
                instancePhotoNFTData = new web3.eth.Contract(
                  PhotoNFTData.abi,
                  deployedNetwork && deployedNetwork.address,
                );
                console.log('=== instancePhotoNFTData ===', instancePhotoNFTData);
              }
            }

            if (instancePhotoNFTMarketplace) {
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
                    currentAccount: currentAccount, 
                    photoNFTMarketplace: instancePhotoNFTMarketplace,
                    photoNFTData: instancePhotoNFTData }, () => {
                      this.refreshValues(instancePhotoNFTMarketplace);
                      setInterval(() => {
                        this.refreshValues(instancePhotoNFTMarketplace);
                    }, 5000);
                });
            }
            else {
              this.setState({ web3, ganacheAccounts, accounts, balance, networkId, networkType, hotLoaderDisabled, isMetaMask });
            }

            ///@dev - NFT（Always load listed NFT data
            const allPhotos = await this.getAllPhotos();
            this.setState({ allPhotos: allPhotos })
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

    refreshValues = (instancePhotoNFTMarketplace) => {
        if (instancePhotoNFTMarketplace) {
          console.log('refreshValues of instancePhotoNFTMarketplace');
        }
    }
    
    handlePhotoCategory = (event) => {
      this.setState({ valuePhotoCategory: event.target.value });
    }


    handleSearch = (event) => {
      this.setState({ searchWord: event.target.value });
    }
    // handleAccountClick = (val, event) => {
    //   event.preventDefault();
    // }

    render() {
        const { web3, allPhotos, currentAccount, valuePhotoCategory, searchWord } = this.state;
        return (
            <div className={styles.contracts}>
              <h2>NFT based Photo MarketPlace</h2>
              <div>
                <Field label="Category">
                  <Select
                    onChange={this.handlePhotoCategory}
                    items={this.state.optionCategories}
                  />
                </Field>
                <Field label="">
                    <Input
                        type="text"
                        width={1}
                        placeholder="search"
                        required={true}
                        value={ searchWord }
                        onChange={ this.handleSearch }
                    />
                </Field>
              </div>
              
              { allPhotos.map((photo, key) => {
                var metaData = photo.photoMeta.split("::");

                return (
                  <div key={key} className="">
                    <div className={styles.widgets}>

                      { (
                         metaData[0].toLowerCase().indexOf(searchWord.toLowerCase())!=-1
                        || metaData[2].toLowerCase().indexOf(searchWord.toLowerCase())!=-1
                        || photo.ownerAddress.toLowerCase().indexOf(searchWord.toLowerCase())!=-1)
                        && ((valuePhotoCategory == 'All'&& photo.status == "Open") || 
                          (metaData[0] == valuePhotoCategory&&photo.status == "Open")) ?
                            <Card width={"360px"}
                                  maxWidth={"360px"}
                                  mx={"auto"} 
                                  my={5} 
                                  p={20} 
                                  borderColor={"#E8E8E8"}>
                                <Image
                                  alt="random unsplash image"
                                  borderRadius={8}
                                  height="100%"
                                  maxWidth='100%'
                                  src={ `https://ipfs.io/ipfs/${photo.ipfsHashOfPhoto}` }
                                />

                                <span style={{ padding: "20px" }}></span>

                                <p>Photo Name: { photo.photoNFTName }</p>

                                <p>Category: { metaData[0] }</p>
                                <p>Artist Name: { metaData[1] }</p>
                                <p>Photo Description: { metaData[2] }</p>

                                <p>Photo Price: { web3.utils.fromWei(`${photo.photoPrice}`, 'ether') } ETH</p>
                                <p>Fee: { web3.utils.fromWei(`${(photo.photoPrice/100)*2.5}`, 'ether') } ETH</p>
                                <p>Owner: <a href={"/user-profile/"+photo.ownerAddress}>{ photo.ownerAddress }</a></p>
                                {/* <p>Owner: <a onClick={(e) => this.handleAccountClick(photo.ownerAddress, e)}>{ photo.ownerAddress }</a></p> */}
                                
                                <br />

                                {currentAccount != photo.ownerAddress?
                                  <Button size={'medium'} width={1} value={ photo.photoNFT } onClick={() => this.buyPhotoNFT(photo.photoNFT)}> Buy ({ web3.utils.fromWei(`${(photo.photoPrice/100)*102.5}`, 'ether') } ETH) </Button>
                                  :
                                  <Button size={'medium'} width={1} value={ photo.photoNFT } onClick={() => this.buyPhotoNFT(photo.photoNFT)} disabled> Buy </Button>
                                }

                                <span style={{ padding: "5px" }}></span>
                            </Card>
                        :
                            "" 
                        }

                    </div>
                  </div>
                )
              }) }
            </div>
        );
    }
}
