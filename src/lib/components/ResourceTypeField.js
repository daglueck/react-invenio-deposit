// This file is part of React-Invenio-Deposit
// Copyright (C) 2020-2021 CERN.
// Copyright (C) 2020-2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import _get from "lodash/get";
import { FieldLabel, SelectField } from "react-invenio-forms";
import { i18next } from "@translations/i18next";

export class ResourceTypeField extends Component {
  groupErrors = (errors, fieldPath) => {
    const fieldErrors = _get(errors, fieldPath);
    if (fieldErrors) {
      return { content: fieldErrors };
    }
    return null;
  };

  /**
   * Generate label value
   *
   * @param {object} option - back-end option
   * @returns {string} label
   */
  _label = (option) => {
    return option.type_name + (option.subtype_name ? " / " + option.subtype_name : "");
  };

  /**
   * Convert back-end options to front-end options.
   *
   * @param {array} propsOptions - back-end options
   * @returns {array} front-end options
   */
  createOptions = (propsOptions) => {
    return propsOptions
      .map((o) => ({ ...o, label: this._label(o) }))
      .sort((o1, o2) => o1.label.localeCompare(o2.label))
      .map((o) => {
        return {
          value: o.id,
          icon: o.icon,
          text: o.label,
        };
      });
  };

  render() {
    const { fieldPath, label, labelIcon, options, required, ...restProps } = this.props;
    const frontEndOptions = this.createOptions(options);
    const fieldLabel = label ? <FieldLabel htmlFor={fieldPath} icon={labelIcon} label={label} /> : undefined;
    return (
      <SelectField
        fieldPath={fieldPath}
        label={fieldLabel}
        optimized
        options={frontEndOptions}
        selectOnBlur={false}
        required={required}
        {...restProps}
      />
    );
  }
}

ResourceTypeField.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  label: PropTypes.string,
  labelIcon: PropTypes.string,
  labelclassname: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.string,
      type_name: PropTypes.string,
      subtype_name: PropTypes.string,
      id: PropTypes.string,
    })
  ).isRequired,
  required: PropTypes.bool,
};

ResourceTypeField.defaultProps = {
  label: undefined,
  labelIcon: undefined,
  labelclassname: "field-label-class",
  required: false,
};
