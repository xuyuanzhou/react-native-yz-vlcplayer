/**
 * Created by yuanzhou.xu on 2018/5/14.
 */
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Platform,
  Animated,
  Dimensions
} from 'react-native';
import VLCPlayer from '../VLCPlayer';
import PropTypes from 'prop-types';
const deviceHeight = Dimensions.get('window').height;
const deviceWidth = Dimensions.get('window').width;

export default class VLCPlayerView extends Component {
  static propTypes = {
    //uri: PropTypes.string,
  };


  constructor(props) {
    super(props);
    this.state = {
      paused: true,
      showLoading: true,
      showAdLoading: true,
      loadingSuccess: false,
      isFull: false,
      currentTime: 0,
      totalTime: 0,
      showControls: false,
      seek: 0,
      volume: 200,
      muted: false,
      isError: false,
    };
    this.touchTime = 0;
    this.viewingTime = 0;
    this.initSuccess = false;
  }

  static defaultProps = {
    initPaused: false,
    source: null,
    seek: 0,
    playInBackground: false,
    isAd: false,
    autoplay: false,
    lookTime: 0,
    totalTime: 0,
  };


   /*****************************
   *                            *
   *    VLCPlayer  callback     *
   *                            *
   *****************************/

  /**
   * when the video is play
   * @param event
   */
  _onPlaying = (event) => {
    console.log('onPlaying');
  }

  /**
   * when then video is paused
   * @param event
   */
  _onPaused = (event) =>  {
    console.log('onPaused');
  }

  /**
   * when the video is buffering
   * @param event
   */
  _onBuffering = (event) => {
    this.props.onBuffering &&  this.props.onBuffering(event);
  }

  /**
   * get status of video if isPlaying
   * @param event
   * @private
   */
  _onIsPlaying =(event)=>{
    this.props.onIsPlaying && this.props.onIsPlaying(event)
  }

  /**
   * when video is error
   * @param e
   * @private
   */
  _onError = e => {
    this.props.onError && this.props.onError(e);
  };

  _onSnapshot = e => {
    this.props.onSnapshot &&  this.props.onSnapshot(e);
  }

  /**
   * when the vido is open
   * @param e
   * @private
   */
  _onOpen = e => {
    console.log('onOpen');
    console.log(e);
  };

  /**
   * when the  video is init
   * @param e
   * @private
   */
  _onLoadStart = e => {
    this.props.onLoadStart && this.props.onLoadStart(e);
  };

  /**
   * when the video  progress is change
   * @param event
   */
  _onProgress = (event) => {
    this.props.onProgressChange &&
    this.props.onProgressChange({
      currentTime: event.currentTime / 1000,
      totalTime: event.duration / 1000,
    });
  }

  /**
   * when the video is ended
   * @param event
   */
  _onEnded = (event) => {
    let { onEnd } = this.props;
    onEnd && onEnd(event);
  }

  /**
   * when the video is stopped
   * @param event
   * @private
   */
  _onStopped = (event) => {
    this.props.onStopped && this.props.onStopped(event);
  }


  /*****************************************************************
   *                                                               *
   *                      VLCPlayer  method                        *
   *                                                               *
   *     You can use these  like:                                  *
   *                                                               *
   *    <VLCPlayerView ref={ ref => this.vlcPlayerView = ref }/>   *
   *                                                               *
   *     this.vlcPlayerView.play();                                *
   *                                                               *
   *                                                               *
   *                                                               *
   *****************************************************************/


  /**
   * start then video
   */
  play = () => {
    this.vlcPlayer.play(false);
  };

  /**
   * paused the video
   */
  pause = () => {
    this.vlcPlayer.play(true);
  };

  /**
   * change the seek of video
   * @param value
   */
  seek = (value)=> {
    this.vlcPlayer.seek(value);
  }

  position = (position)=> {
    this.vlcPlayer.position(position);
  }

  volume = (volume)=>{
   this.setState({
     volume: volume
   })
  }

  /**
   * reload the video
   * @param value
   */
  reload = (value) => {
    this.vlcPlayer.resume && this.vlcPlayer.resume(value);
  };

  snapshot = (path)=>{
    this.vlcPlayer && this.vlcPlayer.snapshot(path);
  }

  /**
   *
   * @param value
   */
  muted = (value) => {
    this.setState({
      muted: value
    });
  }


  /******************************
   *                            *
   *          UI                *
   *                            *
   ******************************/

  /**
   * 渲染loading
   * @return {*}
   * @private
   */
  _renderLoading = ()=>{
    let { showAd, isEndAd, isAd, pauseByAutoplay} = this.props;
    let { showLoading, showAdLoading } = this.state;
    if(!pauseByAutoplay){
      if(isAd){
        if(showAdLoading){
          return(
            <View style={styles.loading}>
              <ActivityIndicator size={'large'} animating={true} color="#fff" />
            </View>
          )
        }
      }else{
        if(showLoading && ((showAd && isEndAd) || !showAd)){
          return(
            <View style={styles.loading}>
              <ActivityIndicator size={'large'} animating={true} color="#fff" />
            </View>
          )
        }
      }
    }

    return null;
  }

  /**
   * 布局发生变化
   * @param e
   * @private
   */
  onLayout = e => {
    let { width, height } = e.nativeEvent.layout;
    this.setState({
      width,
      height
    })
  };


  render() {
    let {
      onEnd,
      style,
      isAd,
      url,
      volume,
      muted,
      videoAspectRatio,
      mediaOptions,
      initOptions,
      initType,
      autoplay,
      isFull
    } = this.props;
    let { width, height} = this.state;
    let source = {};
    if (url) {
      if (url.split) {
        source = { uri: url };
      } else {
        source = url;
      }
    }
    /*if(!videoAspectRatio){
      if(isFull){
        if(width + height - deviceWidth+deviceHeight <= 50){
          videoAspectRatio =  width + ':' + height;
        }
      }else{
        if(width*height > 0){
          videoAspectRatio =  width + ':' + height;
        }
      }
    }
    console.log(videoAspectRatio);*/
    return (
      <View style={[{flex:1},style]}>
        <View style={{flex:1}} onLayout={this.onLayout}>
          <VLCPlayer
            ref={ref => (this.vlcPlayer = ref)}
            style={styles.video}
            autoplay={autoplay}
            source={source}
            volume={this.state.volume}
            muted={this.state.muted}
            videoAspectRatio={videoAspectRatio}
            onProgress={this._onProgress}
            onEnd={this._onEnded}
            onStopped={this._onStopped}
            onPlaying={this._onPlaying}
            onBuffering={this._onBuffering}
            onPaused={this.onPaused}
            onError={this._onError}
            onOpen={this._onOpen}
            onLoadStart={this._onLoadStart}
            onSnapshot={this._onSnapshot}
            onIsPlaying={this._onIsPlaying}
            mediaOptions={mediaOptions ||
              {
                ':network-caching': 1500,
                ':live-caching': 1500,
              }
            }
            initOptions={initOptions || []}
            initType={initType || 1}
          />
        </View>
       {/* {this._renderLoading()}*/}
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoBtn: {
    flex: 1,
  },
  video: {
   flex:1
  },
  loading: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ad: {
    backgroundColor: 'rgba(255,255,255,1)',
    height: 30,
    marginRight: 10,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  topView: {
    top: 0,//Platform.OS === 'ios' ? statusBarHeight : 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    left: 0,
    height: 37,
    zIndex: 999,
    position: 'absolute',
    width: '100%',
  },
  backBtn: {
    height: 37,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    //marginLeft: 10,
    marginRight: 8,
    paddingTop: 3,
    justifyContent: 'center',
    alignItems: 'center',
    height: 37,
    width: 40,
  },

  bottomView: {
    bottom: 0,
    left: 0,
    height: 37,
    zIndex:666,
    position: 'absolute',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0)',
  },
});
