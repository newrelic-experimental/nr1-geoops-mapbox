import React from 'react';

export default class FileUploader extends React.PureComponent {
  state = { count: 0 };

  handleFileInput = ({ target }) => {
    const file = target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        throw new Error('Error: File size must not exceed 1MB');
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.setState({
          locationString: reader.result,
          count: reader.result.split('\n').length - 1
        });
      };
      reader.readAsText(file);
    }
  };

  render() {
    const { count } = this.state;
    const { onFileSelect } = this.props;
    return (
      <div className="file-uploader">
        <input
          accept="text/csv, .csv"
          type="file"
          onChange={this.handleFileInput}
        />
        <button
          type="button"
          disabled={!count}
          onClick={() => onFileSelect(this.state.locationString)}
          className="btn btn-primary"
        >
          Add {count > 0 && `${count} `}Locations...
        </button>
      </div>
    );
  }
}
