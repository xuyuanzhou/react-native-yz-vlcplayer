import React from 'react';
import ReactNative from 'react-native';

const { Component } = React;

import PropTypes from 'prop-types';

const { StyleSheet, requireNativeComponent, NativeModules, View, Platform } = ReactNative;
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';

export default class VLCPlayer extends Component {
    constructor(props, context) {
        super(props, context);
        this.seek = this.seek.bind(this);
        this.resume = this.resume.bind(this);
        this.play = this.play.bind(this);
        this.snapshot = this.snapshot.bind(this);
        this._assignRoot = this._assignRoot.bind(this);
        this._onProgress = this._onProgress.bind(this);
        this._onLoadStart = this._onLoadStart.bind(this);
        this._onSnapshot = this._onSnapshot.bind(this);
        this._onIsPlaying = this._onIsPlaying.bind(this);
        this._onVideoStateChange = this._onVideoStateChange.bind(this);
        this.clear = this.clear.bind(this);
        this.changeVideoAspectRatio = this.changeVideoAspectRatio.bind(this);

    }

    static defaultProps = {
        autoplay: true,
    };

    setNativeProps(nativeProps) {
        this._root.setNativeProps(nativeProps);
    }

    clear(){
        this.setNativeProps({ clear: true });
    }

    seek(pos) {
        this.setNativeProps({ seek: pos });
    }

    autoAspectRatio(isAuto){
        this.setNativeProps({ autoAspectRatio: isAuto });
    }

    changeVideoAspectRatio(ratio){
        this.setNativeProps({ videoAspectRatio: ratio });
    }

    play(paused){
        this.setNativeProps({ paused: paused });
    }

    position(position){
        this.setNativeProps({ position: position });
    }

    resume(isResume) {
        this.setNativeProps({ resume: isResume });
    }

    snapshot(path) {
        this.setNativeProps({ snapshotPath: path });
    }

    _assignRoot(component) {
        this._root = component;
    }

    _onVideoStateChange(event){
        //
        let type = event.nativeEvent.type;
        if(__DEV__ && this.props.showLog){
            console.log(type,event.nativeEvent);
        }
        switch (type){
            case 'Opening':
                this.props.onOpen && this.props.onOpen(event.nativeEvent);
                this.props.onIsPlaying && this.props.onIsPlaying(event.nativeEvent);
                break;
            case 'Playing':
                this.props.onPlaying && this.props.onPlaying(event.nativeEvent);
                this.props.onIsPlaying && this.props.onIsPlaying(event.nativeEvent);
                break;
            case 'Paused':
                this.props.onPaused && this.props.onPaused(event.nativeEvent);
                this.props.onIsPlaying && this.props.onIsPlaying(event.nativeEvent);
                break;
            case 'Stoped':
                this.props.onStopped && this.props.onStopped(event.nativeEvent);
                this.props.onIsPlaying && this.props.onIsPlaying(event.nativeEvent);
                break;
            case 'Ended':
                this.props.onEnd && this.props.onEnd(event.nativeEvent);
                this.props.onIsPlaying && this.props.onIsPlaying(event.nativeEvent);
                break;
            case 'Buffering':
                this.props.onBuffering && this.props.onBuffering(event.nativeEvent);
                this.props.onIsPlaying && this.props.onIsPlaying(event.nativeEvent);
                break;
            case 'onLoadStart':
                this.props.onLoadStart && this.props.onLoadStart(event.nativeEvent);
                break;
            case 'Error':
                this.props.onError && this.props.onError(event.nativeEvent);
                this.props.onIsPlaying && this.props.onIsPlaying(event.nativeEvent);
                break;
            case 'TimeChanged':
                this.props.onProgress && this.props.onProgress(event.nativeEvent);
                this.props.onIsPlaying && this.props.onIsPlaying(event.nativeEvent);
                break;
            default:
                this.props.onVideoStateChange && this.props.onVideoStateChange(event);
                break;
        }
    }

    _onLoadStart(event){
        if (this.props.onLoadStart) {
            this.props.onLoadStart(event.nativeEvent);
        }
    }

    _onProgress(event) {
        if (this.props.onProgress) {
            this.props.onProgress(event.nativeEvent);
        }
    }


    _onIsPlaying(event){
        if(this.props.onIsPlaying){
            this.props.onIsPlaying(event.nativeEvent);
        }
    }

    _onSnapshot(event){
        if (this.props.onSnapshot) {
            this.props.onSnapshot(event.nativeEvent);
        }
    }

    render() {
        const source = resolveAssetSource({ ...this.props.source }) || {};
        let uri = source.uri || '';
        let isNetwork = !!(uri && uri.match(/^https?:/));
        const isAsset = !!(uri && uri.match(/^(assets-library|file|content|ms-appx|ms-appdata):/));
        if(!isAsset){
            isNetwork = true;
        }
        if (uri && uri.match(/^\//)) {
            isNetwork = false;
        }
        if(Platform.OS === 'ios'){
            source.mediaOptions = this.props.mediaOptions || {};
        }else{
            let mediaOptionsList = [];
            let mediaOptions = this.props.mediaOptions || {};
            let keys = Object.keys(mediaOptions);
            for(let i=0; i < keys.length - 1; i++){
                let optionKey = keys[i];
                let optionValue = mediaOptions[optionKey];
                mediaOptionsList.push(optionKey + '=' + optionValue);
            }
            source.mediaOptions = mediaOptionsList;
        }
        source.initOptions = this.props.initOptions || [];
        source.isNetwork = isNetwork;
        source.autoplay = this.props.autoplay;
        if(!isNaN(this.props.hwDecoderEnabled) && !isNaN(this.props.hwDecoderForced)){
            source.hwDecoderEnabled = this.props.hwDecoderEnabled;
            source.hwDecoderForced =  this.props.hwDecoderForced;
        }
        if(this.props.initType){
            source.initType = this.props.initType;
        }else{
            source.initType = 1;
        }

        //repeat the input media
        //source.initOptions.push('--input-repeat=1000');
        const nativeProps = Object.assign({}, this.props);
        Object.assign(nativeProps, {
            style: [styles.base, nativeProps.style],
            source: source,
            onVideoLoadStart: this._onLoadStart,
            onVideoProgress: this._onProgress,
            onVideoStateChange: this._onVideoStateChange,
            onSnapshot: this._onSnapshot,
            onIsPlaying: this._onIsPlaying,
            progressUpdateInterval: 250,
        });

        return <RCTVLCPlayer ref={this._assignRoot} {...nativeProps} />;
    }
}

VLCPlayer.propTypes = {
    /* Native only */
    rate: PropTypes.number,
    seek: PropTypes.number,
    resume: PropTypes.bool,
    position: PropTypes.number,
    snapshotPath: PropTypes.string,
    paused: PropTypes.bool,
    autoAspectRatio: PropTypes.bool,
    videoAspectRatio: PropTypes.string,
    /**
     * 0 --- 200
     */
    volume: PropTypes.number,
    volumeUp:PropTypes.number,
    volumeDown: PropTypes.number,
    repeat: PropTypes.bool,
    muted: PropTypes.bool,

    hwDecoderEnabled: PropTypes.number,
    hwDecoderForced: PropTypes.number,

    onVideoLoadStart: PropTypes.func,
    onVideoStateChange: PropTypes.func,
    onVideoProgress: PropTypes.func,
    onSnapshot: PropTypes.func,
    onIsPlaying: PropTypes.func,
    onOpen: PropTypes.func,
    onLoadStart:PropTypes.func,


    /* Wrapper component */
    source: PropTypes.oneOfType([PropTypes.object,PropTypes.number]),
    play: PropTypes.func,
    snapshot: PropTypes.func,
    onError: PropTypes.func,
    onProgress: PropTypes.func,
    onEnded: PropTypes.func,
    onStopped: PropTypes.func,
    onPlaying: PropTypes.func,
    onPaused: PropTypes.func,

    /* Required by react-native */
    scaleX: PropTypes.number,
    scaleY: PropTypes.number,
    translateX: PropTypes.number,
    translateY: PropTypes.number,
    rotation: PropTypes.number,
    ...View.propTypes,
};

const styles = StyleSheet.create({
    base: {
        overflow: 'hidden',
    },
});
const RCTVLCPlayer = requireNativeComponent('RCTVLCPlayer', VLCPlayer);
