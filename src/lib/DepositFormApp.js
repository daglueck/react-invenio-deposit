// This file is part of React-Invenio-Deposit
// Copyright (C) 2020-2022 CERN.
// Copyright (C) 2020-2022 Northwestern University.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import { i18next } from "@translations/i18next";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { I18nextProvider } from "react-i18next";
import { Provider } from "react-redux";
import {
  DepositApiClient,
  DepositFileApiClient,
  RDMDepositApiClient,
  RDMDepositFileApiClient,
} from "./DepositApiClient";
import { DepositBootstrap } from "./DepositBootstrap";
import { DepositDraftsService, RDMDepositDraftsService } from "./DepositDraftsService";
import { DepositFilesService, RDMDepositFilesService } from "./DepositFilesService";
import {
  DepositRecordSerializer,
  RDMDepositRecordSerializer,
} from "./DepositRecordSerializer";
import { DepositService } from "./DepositService";
import { configureStore } from "./store";
import { RDMUploadProgressNotifier } from "./UploadProgressNotifier";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";

export class DepositFormApp extends Component {
  constructor(props) {
    super(props);

    const recordSerializer = props.recordSerializer
      ? props.recordSerializer
      : new RDMDepositRecordSerializer(
          props.config.default_locale,
          props.config.custom_fields.vocabularies
        );

    const apiHeaders = props.config.apiHeaders ? props.config.apiHeaders : null;
    const additionalApiConfig = { headers: apiHeaders };

    const apiClient = props.apiClient
      ? props.apiClient
      : new RDMDepositApiClient(
          additionalApiConfig,
          props.config.createUrl,
          recordSerializer
        );

    const fileApiClient = props.fileApiClient
      ? props.fileApiClient
      : new RDMDepositFileApiClient(additionalApiConfig);

    const draftsService = props.draftsService
      ? props.draftsService
      : new RDMDepositDraftsService(apiClient);

    const filesService = props.filesService
      ? props.filesService
      : new RDMDepositFilesService(fileApiClient, props.config.fileUploadConcurrency);

    const service = new DepositService(draftsService, filesService);

    const appConfig = {
      config: props.config,
      record: recordSerializer.deserialize(props.record),
      preselectedCommunity: props.preselectedCommunity,
      files: props.files,
      apiClient: apiClient,
      fileApiClient: fileApiClient,
      service: service,
      permissions: props.permissions,
      recordSerializer: recordSerializer,
    };

    this.store = configureStore(appConfig);

    const progressNotifier = new RDMUploadProgressNotifier(this.store.dispatch);
    filesService.setProgressNotifier(progressNotifier);
  }

  render() {
    const { 
      children,
      validateOnBlur,
      validateOnChange,
      validateOnMount,
      validationSchema,
    } = this.props;

    return ( 
      <Provider store={this.store}>
        <I18nextProvider i18n={i18next}>
          <DndProvider backend={HTML5Backend}>
            <DepositBootstrap 
              validateOnBlur={validateOnBlur}
              validateOnChange={validateOnChange}
              validateOnMount={validateOnMount}
              validationSchema={validationSchema}
            >
              {children}
            </DepositBootstrap>
          </DndProvider>
        </I18nextProvider>
      </Provider>
    );
  }
}

DepositFormApp.propTypes = {
  config: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
  preselectedCommunity: PropTypes.object,
  files: PropTypes.object,
  permissions: PropTypes.object,
  apiClient: PropTypes.instanceOf(DepositApiClient),
  fileApiClient: PropTypes.instanceOf(DepositFileApiClient),
  draftsService: PropTypes.instanceOf(DepositDraftsService),
  filesService: PropTypes.instanceOf(DepositFilesService),
  recordSerializer: PropTypes.instanceOf(DepositRecordSerializer),
  children: PropTypes.node,
  validateOnBlur: PropTypes.bool,
  validateOnChange: PropTypes.bool,
  validateOnMount: PropTypes.bool,
  validationSchema: PropTypes.object,
};

DepositFormApp.defaultProps = {
  preselectedCommunity: undefined,
  permissions: undefined,
  apiClient: undefined,
  fileApiClient: undefined,
  draftsService: undefined,
  filesService: undefined,
  recordSerializer: undefined,
  files: undefined,
  children: undefined,
  validateOnBlur: undefined,
  validateOnChange: undefined,
  validateOnMount: undefined,
  validationSchema: undefined,
};
