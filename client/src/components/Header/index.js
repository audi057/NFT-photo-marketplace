import React, { Component }from 'react';
import styles from './header.module.scss';
import getWeb3, { getGanacheWeb3, Web3 } from "../../utils/getWeb3";

class Header extends Component {
  constructor(props) {    
    super(props);
    this.state = {
      messageWallet: 'Connect'
    };
  }

  connectWallet = async () => {
    try{
      const accounts =  await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = this.minimize(accounts[0]);
      this.setState({messageWallet: account});
    } catch (e) {
      console.log(e)
    }
  }

  minimize = (string) => {
    if ("undefined" == typeof string)
        return false;
    var return_str = '';
    return_str = string.substr(0, 4);
    return_str = return_str + "..." + string.substr(-4);
    return return_str;
  }

  render() {
    this.connectWallet();
    return (
      <div className={styles.header}>
        <nav id="menu" className="menu">
          <ul>
            <li><a href="/" className={styles.link}><span style={{ padding: "60px" }}>Logo</span></a></li>

            <li><a href="/publish" className={styles.link}> Publish</a></li>

            <li><a href="/my-photos" className={styles.link}> My Photos</a></li>

            {process.env.NODE_ENV !== 'photo_marketplace' && (
              <li><a href="/photo-marketplace" className={styles.link}> PhotoMarketPlace</a></li>
            )}
          </ul>
          <div>
            <button className={styles.connectbtn} onClick={() => this.connectWallet()}>{this.state.messageWallet}</button>
          </div>
        </nav>
    </div>
    )
  }
}

export default Header;
