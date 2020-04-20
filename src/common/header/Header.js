import React, { Component } from "react";
import "./Header.css";
import * as Constants from "../../common/Constants";
import * as Utils from "../../common/Utils";
import * as UtilsUI from "../../common/UtilsUI";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import IconButton from "@material-ui/core/IconButton";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import SearchIcon from "@material-ui/icons/Search";
import Button from "@material-ui/core/Button";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import Typography from "@material-ui/core/Typography";
import Modal from "react-modal";
import Input from "@material-ui/core/Input";
import { Link } from "react-router-dom";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import FormHelperText from "@material-ui/core/FormHelperText";

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
  searchInput: {
    width: "80%"
  },
  uploadIcon: {
    paddingLeft: 10
  },
  profileIconButton: {
    padding: 0
  }
};

/**
 * Class component for the header
 * @class Header
 * @extends {Component}
 */
class Header extends Component {
  constructor() {
    super();

    this.openUploadImageModal = this.openUploadImageModal.bind(this);
    this.closeUploadImageModal = this.closeUploadImageModal.bind(this);
    this.selectImageForUpload = this.selectImageForUpload.bind(this);
    this.changeDescriptionHandlerInUploadImageModal = this.changeDescriptionHandlerInUploadImageModal.bind(
      this
    );
    this.changeHashtagsHandlerInUploadImageModal = this.changeHashtagsHandlerInUploadImageModal.bind(
      this
    );
    this.uploadClickHandlerInUploadModal = this.uploadClickHandlerInUploadModal.bind(
      this
    );
    this.profileIconClickHandler = this.profileIconClickHandler.bind(this);
    this.logoutClickHandler = this.logoutClickHandler.bind(this);
  }

  state = {
    currentUserDetails: {
      profileImage: "",
      username: ""
    },
    showUserProfileDropDown: false,
    isUploadModalOpen: false,
    uploadImageFormValues: {
      imageFile: {},
      imagePreviewUrl: "",
      description: "",
      hashtags: ""
    },
    uploadImageFormValidationClassnames: {
      image: Constants.DisplayClassname.DISPLAY_NONE,
      description: Constants.DisplayClassname.DISPLAY_NONE,
      hashtags: Constants.DisplayClassname.DISPLAY_NONE
    }
  };

  componentDidMount() {
    this.getUserInformation();
  }

  getUserInformation = () => {
    if (
      !Utils.isUndefinedOrNullOrEmpty(sessionStorage.getItem("access-token"))
    ) {
      const requestUrl =
        "https://api.instagram.com/v1/users/self/?access_token=" +
        sessionStorage.getItem("access-token");
      const that = this;
      Utils.makeApiCall(
        requestUrl,
        null,
        null,
        Constants.ApiRequestTypeEnum.GET,
        null,
        responseText => {
          const userDetails = { ...this.state.currentUserDetails };
          userDetails.profileImage = JSON.parse(
            responseText
          ).data.profile_picture;
          userDetails.username = JSON.parse(responseText).data.username;
          that.setState({
            currentUserDetails: userDetails
          });
          sessionStorage.setItem(
            "user-details",
            JSON.parse(responseText).data.username
          );
        },
        () => {}
      );
    }
  };

  openUploadImageModal = () => {
    this.setState({
      isUploadModalOpen: true
    });
  };

  closeUploadImageModal = () => {
    let newUploadImageModalFormValues = { ...this.state.uploadImageFormValues };
    Utils.assignEmptyStringToAllKeysInObj(newUploadImageModalFormValues);
    const currentUploadImageFormValidationClassnames = {
      ...this.uploadImageFormValidationClassnames
    };

    currentUploadImageFormValidationClassnames.image =
      Constants.DisplayClassname.DISPLAY_NONE;
    currentUploadImageFormValidationClassnames.description =
      Constants.DisplayClassname.DISPLAY_NONE;
    currentUploadImageFormValidationClassnames.hashtags =
      Constants.DisplayClassname.DISPLAY_NONE;

    this.setState({
      isUploadModalOpen: false,
      uploadImageFormValues: newUploadImageModalFormValues,
      uploadImageFormValidationClassnames: currentUploadImageFormValidationClassnames
    });
  };

  selectImageForUpload = event => {
    event.preventDefault();

    const reader = new FileReader();
    const file = event.target.files[0];

    reader.onloadend = () => {
      const currentUploadImageFormValues = {
        ...this.state.uploadImageFormValues
      };
      currentUploadImageFormValues.imageFile = file;
      currentUploadImageFormValues.imagePreviewUrl = reader.result;
      this.setState({
        uploadImageFormValues: currentUploadImageFormValues
      });
    };

    reader.readAsDataURL(file);
  };

  changeDescriptionHandlerInUploadImageModal = event => {
    let currentUploadImageFormValues = { ...this.state.uploadImageFormValues };
    currentUploadImageFormValues.description = event.target.value;
    this.setState({
      uploadImageFormValues: currentUploadImageFormValues
    });
  };

  changeHashtagsHandlerInUploadImageModal = event => {
    let currentUploadImageFormValues = { ...this.state.uploadImageFormValues };
    currentUploadImageFormValues.hashtags = event.target.value;
    this.setState({
      uploadImageFormValues: currentUploadImageFormValues
    });
  };

  uploadClickHandlerInUploadModal = () => {
    const image_validation_classname = UtilsUI.findValidationMessageClassname(
      this.state.uploadImageFormValues.imagePreviewUrl,
      Constants.ValueTypeEnum.FORM_FIELD
    );
    const description_validation_classname = UtilsUI.findValidationMessageClassname(
      this.state.uploadImageFormValues.description,
      Constants.ValueTypeEnum.FORM_FIELD
    );
    const hashtags_validation_classname = UtilsUI.findValidationMessageClassname(
      this.state.uploadImageFormValues.hashtags,
      Constants.ValueTypeEnum.FORM_FIELD
    );

    let currentUploadImageFormValidationClassnames = {
      ...this.state.uploadImageFormValidationClassnames
    };
    currentUploadImageFormValidationClassnames.image = image_validation_classname;
    currentUploadImageFormValidationClassnames.description = description_validation_classname;
    currentUploadImageFormValidationClassnames.hashtags = hashtags_validation_classname;

    if (
      Utils.isAnyValueOfObjectUndefinedOrNullOrEmpty(
        this.state.uploadImageFormValues
      )
    ) {
      this.setState({
        uploadImageFormValidationClassnames: currentUploadImageFormValidationClassnames
      });
    } else {
      const imageDetails = {
        id: Math.floor(new Date().getTime() / 1000),
        caption: { text: this.state.uploadImageFormValues.description },
        tags: this.state.uploadImageFormValues.hashtags.split(","),
        images: {
          standard_resolution: {
            url: this.state.uploadImageFormValues.imagePreviewUrl
          }
        },
        user: {
          profile_picture: this.state.currentUserDetails.profileImage,
          username: this.state.currentUserDetails.username
        },
        likes: { count: 0 },
        created_time: Math.floor(new Date().getTime() / 1000)
      };

      this.props.uploadNewImage(imageDetails);
      this.closeUploadImageModal();
    }
  };

  profileIconClickHandler = () => {
    this.setState({
      showUserProfileDropDown: !this.state.showUserProfileDropDown
    });
  };

  logoutClickHandler = () => {
    sessionStorage.removeItem("access-token");
    sessionStorage.removeItem("user-details");
    this.props.history.push({
      pathname: "/"
    });
  };

  render() {
    const { classes } = this.props;

    let logoToRender = null;
    if (this.props.showLink) {
      logoToRender = (
        <Link to="/home" className="logo">
          Image Viewer
        </Link>
      );
    } else {
      logoToRender = <div className="logo">Image Viewer</div>;
    }

    let searchBoxToRender = null;
    if (this.props.showSearch) {
      searchBoxToRender = (
        <div className="header-search-container">
          <div className="search-icon">
            <SearchIcon />
          </div>
          <Input
            onChange={this.props.searchImageByDescription.bind(this)}
            className={classes.searchInput}
            placeholder="Search…"
            disableUnderline
          />
        </div>
      );
    }

    let uploadButtonToRender = null;
    if (this.props.showUpload) {
      uploadButtonToRender = (
        <div className="header-upload-btn-container">
          <Button
            className="button"
            variant="contained"
            color="primary"
            onClick={this.openUploadImageModal}
          >
            Upload
            <CloudUploadIcon className={classes.uploadIcon} />
          </Button>

          <Modal
            ariaHideApp={false}
            isOpen={this.state.isUploadModalOpen}
            contentLabel="Login"
            onRequestClose={this.closeUploadImageModal}
            style={customStyles}
          >
            <Typography variant="headline" component="h2">
              UPLOAD
            </Typography>
            <br />
            <br />

            <div>
              <input
                required
                type="file"
                accept="image/*"
                onChange={this.selectImageForUpload}
              />
              <div
                className={this.state.uploadImageFormValidationClassnames.image}
              >
                <span className="error-msg">required</span>
                <br />
                <br />
              </div>
              {!Utils.isUndefinedOrNullOrEmpty(
                this.state.uploadImageFormValues.imagePreviewUrl
              ) ? (
                <div className="image-preview-container">
                  <img
                    alt="Preview"
                    className="image-preview"
                    src={this.state.uploadImageFormValues.imagePreviewUrl}
                  />
                </div>
              ) : null}
            </div>

            <FormControl required>
              <InputLabel htmlFor="imageDescription">Description</InputLabel>
              <Input
                id="imageDescription"
                type="text"
                value={this.state.uploadImageFormValues.description}
                onChange={this.changeDescriptionHandlerInUploadImageModal}
              />
              <FormHelperText
                className={
                  this.state.uploadImageFormValidationClassnames.description
                }
              >
                <span className="error-msg">required</span>
              </FormHelperText>
            </FormControl>

            <br />
            <br />
            <FormControl required>
              <InputLabel htmlFor="imageHashtags">Hashtags</InputLabel>
              <Input
                id="imageHashtags"
                type="text"
                value={this.state.uploadImageFormValues.hashtags}
                onChange={this.changeHashtagsHandlerInUploadImageModal}
              />
              <FormHelperText
                className={
                  this.state.uploadImageFormValidationClassnames.hashtags
                }
              >
                <span className="error-msg">required</span>
              </FormHelperText>
            </FormControl>
            <br />
            <br />
            <br />

            <Button
              className="button"
              variant="contained"
              color="secondary"
              onClick={this.uploadClickHandlerInUploadModal}
            >
              Upload
            </Button>
          </Modal>
        </div>
      );
    }

    let profileIconButtonToRender = null;
    if (this.props.showProfile) {
      profileIconButtonToRender = (
        <div className="header-profile-btn-container">
          <IconButton
            key="close"
            aria-label="Close"
            onClick={this.profileIconClickHandler}
            className={classes.profileIconButton}
          >
            <img
              src={this.state.currentUserDetails.profileImage}
              className="user-profile-image"
              alt=""
            />
          </IconButton>

          {this.state.showUserProfileDropDown ? (
            <div className="user-profile-drop-down">
              {this.props.enableMyAccount ? (
                <div>
                  <Link to="/profile" className="my-account-dropdown-menu-item">
                    My Account
                  </Link>
                  <hr />
                </div>
              ) : null}
              <div
                onClick={this.logoutClickHandler}
                className="logout-dropdown-menu-item"
              >
                Logout
              </div>
            </div>
          ) : null}
        </div>
      );
    }

    return (
      <MuiThemeProvider>
        <div className="header-main-container">
          <div className="header-logo-container">{logoToRender}</div>
          {searchBoxToRender}
          {uploadButtonToRender}
          {profileIconButtonToRender}
        </div>
      </MuiThemeProvider>
    );
  }
}

Header.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Header);
