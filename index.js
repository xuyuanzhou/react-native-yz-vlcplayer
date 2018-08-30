
const VLCPlayerControl = {
  VLCPlayer: require('./VLCPlayer').default,
  VlCPlayerView: require('./playerView/index').default,
  VlCPlayerViewByMethod: require('./playerViewByMethod/index').default,
  VlcSimplePlayer: require('./playerViewByMethod/index').default,
};

module.exports = VLCPlayerControl;