// This file is part of React-Invenio-Deposit
// Copyright (C) 2020-2021 CERN.
// Copyright (C) 2020-2022 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import _find from "lodash/find";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { getIn, FieldArray } from "formik";
import { FieldLabel } from "react-invenio-forms";
import { Button, Form, Icon, List } from "semantic-ui-react";

import { LicenseModal } from "./LicenseModal";
import { LicenseFieldItem } from "./LicenseFieldItem";
import { i18next } from "@translations/i18next";

/**
 * The user-facing license.
 *
 */
class VisibleLicense {
  /**
   * Constructor.
   *
   * @param {array} uiRights
   * @param {object} right
   * @param {int} index
   */
  constructor(uiRights, right, index) {
    this.index = index;
    this.type = right.id ? "standard" : "custom";
    this.key = right.id || right.title;
    this.initial = this.type === "custom" ? right : null;

    let uiRight =
      _find(
        uiRights,
        right.id ? (o) => o.id === right.id : (o) => o.title === right.title
      ) || {};

    this.description = uiRight.description_l10n || right.description || "";
    this.title = uiRight.title_l10n || right.title || "";
    this.link =
      (uiRight.props && uiRight.props.url) ||
      uiRight.link ||
      (right.props && right.props.url) ||
      right.link ||
      "";
  }
}

class LicenseFieldForm extends Component {
  render() {
    const {
      label,
      labelIcon,
      fieldPath,
      uiFieldPath,
      form: { values },
      move: formikArrayMove,
      push: formikArrayPush,
      remove: formikArrayRemove,
      replace: formikArrayReplace,
      required,
      searchConfig,
      serializeLicenses,
      maxLicenses,
    } = this.props;

    const rights = getIn(values, fieldPath, []);
    const uiRights = getIn(values, uiFieldPath, []);

    const displayAddButtons = rights.length < maxLicenses;

    return (
      <Form.Field required={required}>
        <FieldLabel htmlFor={fieldPath} icon={labelIcon} label={label} />
        <List>
          {rights.map((value, index) => {
            const license = new VisibleLicense(uiRights, value, index);
            return (
              <LicenseFieldItem
                key={license.key}
                license={license}
                moveLicense={formikArrayMove}
                replaceLicense={formikArrayReplace}
                removeLicense={formikArrayRemove}
                searchConfig={searchConfig}
                serializeLicenses={serializeLicenses}
              />
            );
          })}
          {displayAddButtons && <>
          <LicenseModal
            searchConfig={searchConfig}
            trigger={
              <Button type="button" key="standard" icon labelPosition="left">
                <Icon name="add" />
                {i18next.t("Add standard")}
              </Button>
            }
            onLicenseChange={(selectedLicense) => {
              formikArrayPush(selectedLicense);
            }}
            mode="standard"
            action="add"
            serializeLicenses={serializeLicenses}
          />
          <LicenseModal
            searchConfig={searchConfig}
            trigger={
              <Button type="button" key="custom" icon labelPosition="left">
                <Icon name="add" />
                {i18next.t("Add custom")}
              </Button>
            }
            onLicenseChange={(selectedLicense) => {
              formikArrayPush(selectedLicense);
            }}
            mode="custom"
            action="add"
          />
          </>}
        </List>
      </Form.Field>
    );
  }
}

LicenseFieldForm.propTypes = {
  label: PropTypes.node.isRequired,
  labelIcon: PropTypes.node,
  fieldPath: PropTypes.string.isRequired,
  uiFieldPath: PropTypes.string,
  form: PropTypes.object.isRequired,
  move: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  replace: PropTypes.func.isRequired,
  required: PropTypes.bool.isRequired,
  searchConfig: PropTypes.object.isRequired,
  serializeLicenses: PropTypes.func,
  maxLicenses: PropTypes.number.isRequired,
};

LicenseFieldForm.defaultProps = {
  labelIcon: undefined,
  uiFieldPath: undefined,
  serializeLicenses: undefined,
};

export class LicenseField extends Component {
  render() {
    const { fieldPath } = this.props;
    return (
      <FieldArray
        name={fieldPath}
        component={(formikProps) => (
          <LicenseFieldForm {...formikProps} {...this.props} />
        )}
      />
    );
  }
}

LicenseField.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string,
  labelIcon: PropTypes.string,
  searchConfig: PropTypes.object.isRequired,
  required: PropTypes.bool,
  serializeLicenses: PropTypes.func,
  uiFieldPath: PropTypes.string,
  maxLicenses: PropTypes.number,
};

LicenseField.defaultProps = {
  label: i18next.t("Licenses"),
  uiFieldPath: "ui.rights",
  labelIcon: "drivers license",
  required: false,
  serializeLicenses: undefined,
  maxLicenses: Infinity
};
