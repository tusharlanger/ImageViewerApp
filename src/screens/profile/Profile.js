import React, { Component } from "react";
import "./Profile.css";
import * as Constants from "../../common/Constants";
import * as Utils from "../../common/Utils";
import * as UtilsUI from "../../common/UtilsUI";
import Header from "../../common/header/Header";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import Typography from "@material-ui/core/Typography";
import Modal from "react-modal";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import FormHelperText from "@material-ui/core/FormHelperText";
import Button from "@material-ui/core/Button";
import FavoriteBorder from "@material-ui/icons/FavoriteBorder";
import Favorite from "@material-ui/icons/Favorite";
import EditIcon from "@material-ui/icons/Edit";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)"
  }
};

const styles = {
  editIconButton: {
    height: 45,
    width: 45
  },
  imagesGridList: {
    margin: "15px !important"
  }
};

class Profile extends Component {
  constructor() {
    super();

    this.fullNameChangeHandler = this.fullNameChangeHandler.bind(this);
  }

  state = {
    isImageDataLoaded: false,
    isUserDataLoaded: false,
    currentUserDetails: {},
    imageData: [],
    fullName: "",
    fullNameRequired: Constants.DisplayClassname.DISPLAY_NONE,
    isEditFullNameModalOpen: false,
    isImageModalOpen: false,
    selectedImageDetails: {
      imageUrl: "",
      description: "",
      like: "",
      numberOfLikes: 0,
      index: 0,
      comment: ""
    },
    currentImage: "",
    curstoryline: "",
    curLike: false,
    curLikes: "0",
    curIndex: 0,
    curComment: ""
  };

  componentDidMount() {
    if (
      Utils.isUndefinedOrNullOrEmpty(sessionStorage.getItem("access-token"))
    ) {
      this.props.history.push({
        pathname: "/"
      });
    } else {
      this.getAllUserData();
      this.getAllImageData();
    }
  }

  getAllUserData = () => {
    const requestUrl =
      this.props.baseUrl +
      "?access_token=" +
      sessionStorage.getItem("access-token");
    const that = this;
    Utils.makeApiCall(
      requestUrl,
      null,
      null,
      Constants.ApiRequestTypeEnum.GET,
      null,
      responseText => {
        that.setState(
          {
            currentUserDetails: JSON.parse(responseText).data,
            profileImage: JSON.parse(responseText).data.profile_picture,
            fullname: JSON.parse(responseText).data.full_name,
            username: JSON.parse(responseText).data.username,
            posts: JSON.parse(responseText).data.counts.media,
            follows: JSON.parse(responseText).data.counts.follows,
            followedBy: JSON.parse(responseText).data.counts.followed_by
          },
          function() {
            that.setState({
              isUserDataLoaded: true
            });
          }
        );
      },
      () => {}
    );
  };

  getAllImageData = () => {
    const requestUrl =
      this.props.baseUrl +
      "/media/recent/?access_token=" +
      sessionStorage.getItem("access-token");
    const that = this;
    Utils.makeApiCall(
      requestUrl,
      null,
      null,
      Constants.ApiRequestTypeEnum.GET,
      null,
      responseText => {
        that.setState(
          {
            imageData: JSON.parse(responseText).data
          },
          function() {
            that.setState({
              isImageDataLoaded: true
            });
          }
        );
      },
      () => {}
    );
  };

  openModalForEditFullName = () => {
    this.setState({
      isEditFullNameModalOpen: true
    });
  };

  closeModalForEditFullName = () => {
    this.setState({
      isEditFullNameModalOpen: false,
      fullName: "",
      fullNameRequired: Constants.DisplayClassname.DISPLAY_NONE
    });
  };

  fullNameChangeHandler = event => {
    this.setState({
      fullName: event.target.value
    });
  };

  updateFullNameClickHandler = () => {
    let fullName_validation_classname = UtilsUI.findValidationMessageClassname(
      this.state.fullName,
      Constants.ValueTypeEnum.FORM_FIELD
    );
    if (
      fullName_validation_classname === Constants.DisplayClassname.DISPLAY_BLOCK
    ) {
      this.setState({
        fullNameRequired: fullName_validation_classname
      });
    } else {
      let userDetails = { ...this.state.currentUserDetails };
      userDetails.full_name = this.state.fullName;
      this.setState({
        currentUserDetails: userDetails
      });
      this.closeModalForEditFullName();
    }
  };

  openImageModal = () => {
    this.setState({
      isImageModalOpen: true
    });
  };

  closeImageModal = () => {
    this.setState({
      isImageModalOpen: false
    });
  };

  imageClickHandler = (url, desc, like, numberOfLikes, index) => {
    Utils.isUndefinedOrNull(desc) ? (desc = "") : (desc = desc.text);
    this.openImageModal();
    let currentSelectedImageDetails = { ...this.state.selectedImageDetails };
    currentSelectedImageDetails.imageUrl = url;
    currentSelectedImageDetails.description = desc;
    currentSelectedImageDetails.like = like;
    currentSelectedImageDetails.numberOfLikes = numberOfLikes;
    currentSelectedImageDetails.index = index;
    this.setState({
      currentImage: url,
      curstoryline: desc,
      curLike: like,
      curLikes: numberOfLikes,
      curIndex: index
    });
  };

  likeButtonClickHandler = actionType => {
    let curImageData = [...this.state.imageData];
    const imagePostIndex = this.state.curIndex;
    curImageData = UtilsUI.likeOrUnlikeImage(
      curImageData,
      imagePostIndex,
      actionType
    );
    let isLiked = null;
    switch (actionType) {
      case Constants.HeartButtonAction.LIKE:
        isLiked = true;
        break;
      case Constants.HeartButtonAction.UNLIKE:
        isLiked = false;
        break;
      default:
        return;
    }
    let curNumberOfLikes = curImageData[imagePostIndex].likes.count;
    if (!Utils.isUndefinedOrNull(curImageData)) {
      this.setState({
        imageData: curImageData,
        curLike: isLiked,
        curLikes: curNumberOfLikes
      });
    }
  };

  addCommentClickHandler = () => {
    let curImageData = [...this.state.imageData];
    if (!Utils.isUndefinedOrNullOrEmpty(this.state.curComment)) {
      curImageData = UtilsUI.addUserComment(
        curImageData,
        this.state.curComment,
        this.state.curIndex
      );
      if (!Utils.isUndefinedOrNull(curImageData)) {
        this.setState({
          imageData: curImageData,
          curComment: ""
        });
      }
    }
  };

  render() {
    const { classes } = this.props;
    return this.state.isUserDataLoaded && this.state.isImageDataLoaded ? (
      <div>
        <MuiThemeProvider>
          <div>
            <Header
              showLink={true}
              history={this.props.history}
              showSearch={false}
              showUpload={false}
              showProfile={true}
              enableMyAccount={false}
            />
            <div className="profile-main-container">
              <div className="user-info-container">
                <div className="profile-picture-container">
                  <img
                    className="profile-image"
                    src={this.state.currentUserDetails.profile_picture}
                    alt=""
                  />
                </div>

                <div className="information-container">
                  <div className="username-container">
                    <div className="username">
                      {this.state.currentUserDetails.username}
                    </div>
                  </div>

                  <div className="count-container">
                    <div className="posts">
                      Posts: {this.state.currentUserDetails.counts.media}
                    </div>
                    <div className="posts">
                      Follows: {this.state.currentUserDetails.counts.follows}
                    </div>
                    <div className="posts">
                      Followed By:{" "}
                      {this.state.currentUserDetails.counts.followed_by}
                    </div>
                  </div>

                  <div className="full-name-container">
                    <span className="fullname">
                      {this.state.currentUserDetails.full_name}
                    </span>
                    <Button
                      variant="fab"
                      color="secondary"
                      className={classes.editIconButton}
                      aria-label="Edit"
                      onClick={this.openModalForEditFullName}
                    >
                      <EditIcon />
                    </Button>
                  </div>
                </div>
              </div>
              {!Utils.isUndefinedOrNull(this.state.imageData) ? (
                <GridList
                  cellHeight={350}
                  cols={3}
                  className={classes.imagesGridList}
                >
                  {this.state.imageData.map((image, index) => (
                    <GridListTile
                      onClick={() =>
                        this.imageClickHandler(
                          image.images.standard_resolution.url,
                          image.caption,
                          image.curLike,
                          image.likes.count,
                          index
                        )
                      }
                      className="image-tile"
                      key={"grid" + image.id}
                    >
                      <img
                        src={image.images.standard_resolution.url}
                        className="movie"
                        alt={
                          Utils.isUndefinedOrNullOrEmpty(image.caption)
                            ? ""
                            : image.caption.text
                        }
                      />
                    </GridListTile>
                  ))}
                </GridList>
              ) : null}
            </div>
          </div>
        </MuiThemeProvider>

        <Modal
          ariaHideApp={false}
          isOpen={this.state.isEditFullNameModalOpen}
          contentLabel="Edit Name"
          onRequestClose={this.closeModalForEditFullName}
          style={customStyles}
        >
          <MuiThemeProvider>
            <div>
              <Typography variant="headline" component="h2">
                Edit
              </Typography>
              <br />
              <FormControl required>
                <InputLabel htmlFor="fullname">Full Name</InputLabel>
                <Input
                  id="fullname"
                  type="text"
                  onChange={this.fullNameChangeHandler}
                />
                <FormHelperText className={this.state.fullNameRequired}>
                  <span className="red">required</span>
                </FormHelperText>
              </FormControl>
              <br />
              <br />
              <br />

              <Button
                className="button"
                variant="contained"
                color="primary"
                onClick={this.updateFullNameClickHandler}
              >
                Update
              </Button>
              <br />
            </div>
          </MuiThemeProvider>
        </Modal>

        <Modal
          ariaHideApp={false}
          isOpen={this.state.isImageModalOpen}
          contentLabel="Login"
          onRequestClose={this.closeImageModal}
          style={customStyles}
        >
          <MuiThemeProvider>
            <div className="image-modal-container">
              <div className="image-modal-left-container">
                <img src={this.state.currentImage} className="image" alt="" />
              </div>

              <div className="image-modal-right-container">
                <div className="modal-user-info-container">
                  <img
                    src={this.state.currentUserDetails.profile_picture}
                    className="user-profile-image"
                    alt=""
                  />
                  <div className="user-information">
                    <span>{this.state.currentUserDetails.username}</span>
                    <br />
                    <br />
                    <span>
                      {!Utils.isUndefinedOrNull(this.state.imageData) &&
                        Utils.formatDate(
                          this.state.imageData[this.state.curIndex].created_time
                        )}
                    </span>
                  </div>
                </div>

                <hr className="custom-horizontal-rule" />
                {this.state.curstoryline.split("#")[0]}
                <br />

                <div className="hashtags-container">
                  {!Utils.isUndefinedOrNull(this.state.imageData) &&
                    this.state.imageData[this.state.curIndex].tags.map(
                      (tag, i) => "#" + tag + " "
                    )}
                </div>

                <div>
                  {Utils.isUndefinedOrNull(this.state.curLike) ||
                  !this.state.curLike ? (
                    <FavoriteBorder
                      onClick={() =>
                        this.likeButtonClickHandler(
                          Constants.HeartButtonAction.LIKE
                        )
                      }
                      className="black"
                      fontSize="large"
                    />
                  ) : (
                    <Favorite
                      onClick={() =>
                        this.likeButtonClickHandler(
                          Constants.HeartButtonAction.UNLIKE
                        )
                      }
                      className="red"
                      fontSize="large"
                    />
                  )}
                  <div className="likes">
                    {this.state.curLikes > Number("0")
                      ? this.state.curLikes
                      : 0}{" "}
                    likes
                  </div>
                  <br />

                  <div className="comments-container">
                    {!Utils.isUndefinedOrNull(this.state.imageData) &&
                      !Utils.isUndefinedOrNull(
                        this.state.imageData[this.state.curIndex].commentList
                      ) &&
                      this.state.imageData[this.state.curIndex].commentList.map(
                        comment => (
                          <div key={comment.id} className="comment">
                            <span className="username-who-commented">
                              {comment.username}:
                            </span>
                            &nbsp;&nbsp;{comment.comment}
                          </div>
                        )
                      )}
                  </div>

                  <div className="add-comment-container">
                    <FormControl className="add-comment-formcontrol">
                      <InputLabel htmlFor="Add a comment">
                        {" "}
                        Add a comment
                      </InputLabel>
                      <Input
                        id="addAComment"
                        value={this.state.curComment}
                        onChange={event =>
                          this.setState({ curComment: event.target.value })
                        }
                      />
                    </FormControl>
                    &nbsp;&nbsp;
                    <FormControl>
                      <Button
                        onClick={this.addCommentClickHandler}
                        variant="contained"
                        color="primary"
                      >
                        ADD
                      </Button>
                    </FormControl>
                  </div>
                </div>
              </div>
            </div>
          </MuiThemeProvider>
        </Modal>
      </div>
    ) : null;
  }
}

Profile.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Profile);
