import React, { Component } from "react";
import "./Home.css";
import * as Constants from "../../common/Constants";
import * as Utils from "../../common/Utils";
import * as UtilsUI from "../../common/UtilsUI";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import Header from "../../common/header/Header";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import ImageCard from "./ImageCard";

const styles = {
  imageCard: {
    marginBottom: 40
  },
  addCommentButton: {
    padding: 0,
    float: "right",
    marginTop: "2%"
  }
};

class Home extends Component {
  constructor() {
    super();

    this.searchImageByDescription = this.searchImageByDescription.bind(this);
    this.uploadNewImage = this.uploadNewImage.bind(this);
    this.likeButtonClickHandler = this.likeButtonClickHandler.bind(this);
  }

  state = {
    isDataLoaded: false,
    imageData: [], 
    filteredImageData: [], 
    currentSearchValue: "",
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
      this.getAllImageData();
    }
  }

  getAllImageData = () => {
    if (
      Utils.isUndefinedOrNullOrEmpty(sessionStorage.getItem("access-token"))
    ) {
      this.props.history.push({
        pathname: "/"
      });
    } else {
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
                isDataLoaded: true
              });
            }
          );
        },
        () => {}
      );
    }
  };

  searchImageByDescription = event => {
    let currImageData = [...this.state.imageData];
    const searchValue = event.target.value;
    if (!Utils.isEmpty(searchValue)) {
      let searchResults = [];
      for (var image in currImageData) {
        if (
          !Utils.isUndefinedOrNull(currImageData[image].caption) &&
          currImageData[image].caption.text
            .toLowerCase()
            .includes(searchValue.toLowerCase())
        ) {
          searchResults.push(currImageData[image]);
        }
      }
      this.setState({
        filteredImageData: searchResults,
        currentSearchValue: searchValue
      });
    } else {
      this.setState({ currentSearchValue: searchValue });
    }
  };

  uploadNewImage = imagePost => {
    let imageData = [...this.state.imageData];
    imageData.unshift(imagePost);
    this.setState({
      imageData: imageData
    });
  };

  likeButtonClickHandler = (imagePostIndex, actionType) => {
    let dataSource = Utils.isUndefinedOrNullOrEmpty(
      this.state.currentSearchValue
    )
      ? [...this.state.imageData]
      : [...this.state.filteredImageData];
    dataSource = UtilsUI.likeOrUnlikeImage(
      dataSource,
      imagePostIndex,
      actionType
    );
    if (!Utils.isUndefinedOrNull(dataSource)) {
      if (Utils.isUndefinedOrNullOrEmpty(this.state.currentSearchValue)) {
        this.setState({
          imageData: dataSource
        });
      } else {
        this.setState({
          filteredImageData: dataSource
        });
      }
    }
  };

  commentChangeHandler = event => {
    this.setState({
      curComment: event.target.value
    });
  };

  addCommentClickHandler = currentImageIndex => {
    let dataSource = Utils.isUndefinedOrNullOrEmpty(
      this.state.currentSearchValue
    )
      ? [...this.state.imageData]
      : [...this.state.filteredImageData];
    if (!Utils.isUndefinedOrNullOrEmpty(this.state.curComment)) {
      dataSource = UtilsUI.addUserComment(
        dataSource,
        this.state.curComment,
        currentImageIndex
      );
      if (!Utils.isUndefinedOrNull(dataSource)) {
        if (Utils.isUndefinedOrNullOrEmpty(this.state.currentSearchValue)) {
          this.setState({
            imageData: dataSource,
            curComment: ""
          });
        } else {
          this.setState({
            filteredImageData: dataSource,
            curComment: ""
          });
        }
      }
    }
  };

  render() {
    const { classes } = this.props;

    const dataSource = Utils.isUndefinedOrNullOrEmpty(
      this.state.currentSearchValue
    )
      ? this.state.imageData
      : this.state.filteredImageData;

    return this.state.isDataLoaded ? (
      <MuiThemeProvider>
        <div>
          <Header
            showLink={false}
            history={this.props.history}
            showSearch={true}
            searchImageByDescription={this.searchImageByDescription}
            showUpload={true}
            uploadNewImage={this.uploadNewImage}
            showProfile={true}
            enableMyAccount={true}
          />
          <div className="images-main-container">
            <div className="left-column">
              {dataSource.map((image, index) =>
                index % 2 === 0 ? (
                  <ImageCard
                    key={index}
                    image={image}
                    index={index}
                    classes={classes}
                    likeButtonClickHandler={this.likeButtonClickHandler}
                    commentChangeHandler={this.commentChangeHandler}
                    addCommentClickHandler={this.addCommentClickHandler}
                  />
                ) : null
              )}
            </div>
            <div className="right-column">
              {dataSource.map((image, index) =>
                index % 2 !== 0 ? (
                  <ImageCard
                    key={index}
                    image={image}
                    index={index}
                    classes={classes}
                    likeButtonClickHandler={this.likeButtonClickHandler}
                    commentChangeHandler={this.commentChangeHandler}
                    addCommentClickHandler={this.addCommentClickHandler}
                  />
                ) : null
              )}
            </div>
          </div>
        </div>
      </MuiThemeProvider>
    ) : null;
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Home);
