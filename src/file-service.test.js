const chai = require('chai');
const got = require('got');
const sinon = require('sinon');


const FileService = require('./file-service');
const utils = require('./utils');

describe('file-service', () => {
  beforeEach(() => {
    this.sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    this.sandbox.restore();
  });

  describe('getContainers', () => {
    it('returns a list of containers when underlying call succeeds', () => {
      // Arrange
      const expectedResult = ['test', 'test2'];
      const getStub = this.sandbox.stub(got, 'get');
      getStub.returns(Promise.resolve({
        statusCode: 200,
        body: JSON.stringify(expectedResult),
      }));
      const client = new FileService('http://127.0.0.1:8080');

      // Act
      return client.getContainers()
        .then((containers) => {
          // Assert
          const getCalls = getStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/containers');
          chai.expect(containers).to.be.eql(expectedResult);
        });
    });

    it('errors when status is not 200', () => {
      // Arrange
      const getStub = this.sandbox.stub(got, 'get');
      getStub.returns(Promise.resolve({
        statusCode: 500,
        body: 'Test error',
      }));
      const client = new FileService('http://127.0.0.1:8080');

      // Act
      client.getContainers()
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          chai.expect(err.message).to.be.equal('An error occurred while obtaining the list of available containers.');
        });
    });
  });

  describe('createContainer', () => {
    it('returns a resolved promise when successful', () => {
      // Arrange
      const postStub = this.sandbox.stub(got, 'post');
      postStub.returns(Promise.resolve({
        statusCode: 201,
      }));
      const client = new FileService('http://127.0.0.1:8080');

      // Act
      return client.createContainer('test')
        .then((data) => {
          // Assert
          const getCalls = postStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/create/test');
          chai.expect(data).to.be.equal(undefined);
        });
    });

    it('returns a rejected promise when container already exists', () => {
      // Arrange
      const postStub = this.sandbox.stub(got, 'post');
      postStub.returns(Promise.resolve({
        statusCode: 409,
      }));
      const client = new FileService('http://127.0.0.1:8080');

      // Act
      return client.createContainer('test')
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          // Assert
          const getCalls = postStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/create/test');
          chai.expect(err.message).to.be.equal('Container with the name "test" already exists.');
        });
    });

    it('returns a rejected promise when an unknown error occurs', () => {
      // Arrange
      const postStub = this.sandbox.stub(got, 'post');
      postStub.returns(Promise.resolve({
        statusCode: 500,
      }));
      const client = new FileService('http://127.0.0.1:8080');

      // Act
      return client.createContainer('test')
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          // Assert
          const getCalls = postStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/create/test');
          chai.expect(err.message).to.be.equal('An error occurred while creating the container.');
        });
    });
  });

  describe('deleteContainerOrPath', () => {
    it('returns a resolved promise when successful', () => {
      // Arrange
      const deleteStub = this.sandbox.stub(got, 'delete');
      deleteStub.returns(Promise.resolve({
        statusCode: 204,
      }));
      const client = new FileService('http://127.0.0.1:8080');

      // Act
      return client.deleteContainerOrPath('test')
        .then((data) => {
          // Assert
          const getCalls = deleteStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/test');
          chai.expect(data).to.be.equal(undefined);
        });
    });

    it('returns a rejected promise when container already exists', () => {
      // Arrange
      const deleteStub = this.sandbox.stub(got, 'delete');
      deleteStub.returns(Promise.resolve({
        statusCode: 409,
      }));
      const client = new FileService('http://127.0.0.1:8080');

      // Act
      return client.deleteContainerOrPath('test')
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          // Assert
          const getCalls = deleteStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/test');
          chai.expect(err.message).to.be.equal('An error occurred while removing the container or path.');
        });
    });

    it('returns a rejected promise when an unknown error occurs', () => {
      // Arrange
      const deleteStub = this.sandbox.stub(got, 'delete');
      deleteStub.returns(Promise.resolve({
        statusCode: 500,
      }));
      const client = new FileService('http://127.0.0.1:8080');

      // Act
      return client.deleteContainerOrPath('test')
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          // Assert
          const getCalls = deleteStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/test');
          chai.expect(err.message).to.be.equal('An error occurred while removing the container or path.');
        });
    });
  });

  describe('downloadFile', () => {
    it('returns result of download file', () => {
      // Arrange
      const fakeBuffer = {};
      const downloadStub = this.sandbox.stub(utils, 'download');
      downloadStub.resolves(fakeBuffer);
      const client = new FileService('http://127.0.0.1:8080');

      // Act
      return client.downloadFile('test/foo')
        .then((buff) => {
          // Assert
          chai.expect(buff).to.be.equal(fakeBuffer);
        });
    });
  });

  describe('getContainerContents', () => {
    it('returns a resolved promise when successful', () => {
      // Arrange
      const expectedResult = {
        directories: [],
        files: ['file1', 'file2'],
      };
      const getStub = this.sandbox.stub(got, 'get');
      getStub.returns(Promise.resolve({
        statusCode: 200,
        body: JSON.stringify(expectedResult),
      }));
      const client = new FileService('http://127.0.0.1:8080');

      // Act
      return client.getContainerContents('test')
        .then((data) => {
          // Assert
          const getCalls = getStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/list/test');
          chai.expect(data).to.be.eql(expectedResult);
        });
    });

    it('returns a rejected promise when an unknown error occurs', () => {
      // Arrange
      const getStub = this.sandbox.stub(got, 'get');
      getStub.returns(Promise.resolve({
        statusCode: 500,
      }));
      const client = new FileService('http://127.0.0.1:8080');

      // Act
      return client.getContainerContents('test')
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          // Assert
          const getCalls = getStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/list/test');
          chai.expect(err.message).to.be.equal('An error occurred while obtaining the content list of a container.');
        });
    });
  });

  describe('uploadFile', () => {
    it('returns a resolved promise when successful', () => {
      // Arrange
      const postStub = this.sandbox.stub(got, 'post');
      postStub.returns(Promise.resolve({
        statusCode: 200,
      }));
      const client = new FileService('http://127.0.0.1:8080');

      // Act
      return client.uploadFile('test', './foo')
        .then((data) => {
          // Assert
          const getCalls = postStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/upload/test');
          chai.expect(data).to.be.eql(undefined);
        });
    });

    it('returns a rejected promise when an unknown error occurs', () => {
      // Arrange
      const postStub = this.sandbox.stub(got, 'post');
      postStub.returns(Promise.resolve({
        statusCode: 500,
      }));
      const client = new FileService('http://127.0.0.1:8080');

      // Act
      return client.uploadFile('test', './foo')
        .then(() => new Error('Test hit then when should hit catch.'))
        .catch((err) => {
          // Assert
          const getCalls = postStub.getCalls();
          chai.expect(getCalls.length).to.be.equal(1);
          chai.expect(getCalls[0].args[0]).to.be.equal('http://127.0.0.1:8080/upload/test');
          chai.expect(err.message).to.be.equal('An error occurred while uploading the file to the container.');
        });
    });
  });
});