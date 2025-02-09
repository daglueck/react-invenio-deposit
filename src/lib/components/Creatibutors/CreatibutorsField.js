// This file is part of React-Invenio-Deposit
// Copyright (C) 2021 CERN.
// Copyright (C) 2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// React-Invenio-Deposit is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { Component } from "react";
import PropTypes from "prop-types";
import { getIn, FieldArray } from "formik";
import { Button, Form, Label, List, Icon } from "semantic-ui-react";
import _get from "lodash/get";
import { FieldLabel } from "react-invenio-forms";

import { CreatibutorsModal } from "./CreatibutorsModal";
import { CreatibutorsFieldItem } from "./CreatibutorsFieldItem";
import { CREATIBUTOR_TYPE } from "./type";
import { sortOptions } from "../../utils";
import { i18next } from "../../i18next";

const creatibutorNameDisplay = (value) => {
  const creatibutorType = _get(value, "person_or_org.type", CREATIBUTOR_TYPE.PERSON);
  const isPerson = creatibutorType === CREATIBUTOR_TYPE.PERSON;

  const familyName = _get(value, "person_or_org.family_name", "");
  const givenName = _get(value, "person_or_org.given_name", "");
  const affiliationName = _get(value, `affiliations[0].name`, "");
  const name = _get(value, `person_or_org.name`);

  const affiliation = affiliationName ? ` (${affiliationName})` : "";

  if (isPerson) {
    const givenNameSuffix = givenName ? `, ${givenName}` : "";
    return `${familyName}${givenNameSuffix}${affiliation}`;
  }

  return `${name}${affiliation}`;
};

class CreatibutorsFieldForm extends Component {
  handleOnContributorChange = (selectedCreatibutor) => {
    const { push: formikArrayPush } = this.props;
    formikArrayPush(selectedCreatibutor);
  };

  render() {
    const {
      form: { values, errors, initialErrors, initialValues },
      remove: formikArrayRemove,
      replace: formikArrayReplace,
      move: formikArrayMove,
      name: fieldPath,
      label,
      labelIcon,
      roleOptions,
      schema,
      modal,
      autocompleteNames,
      addButtonLabel,
      showRole,
      showPersonSearch,
    } = this.props;

    const creatibutorsList = getIn(values, fieldPath, []);
    const formikInitialValues = getIn(initialValues, fieldPath, []);

    const error = getIn(errors, fieldPath, null);
    const initialError = getIn(initialErrors, fieldPath, null);
    const creatibutorsError =
      error || (creatibutorsList === formikInitialValues && initialError);

    return (
      <Form.Field
        required={schema === "creators"}
        className={creatibutorsError ? "error" : ""}
      >
        <FieldLabel htmlFor={fieldPath} icon={labelIcon} label={label} />
        <List>
          {creatibutorsList.map((value, index) => {
            const key = `${fieldPath}.${index}`;
            const identifiersError =
              creatibutorsError &&
              creatibutorsError[index]?.person_or_org?.identifiers;
            const displayName = creatibutorNameDisplay(value);

            return (
              <CreatibutorsFieldItem
                key={key}
                identifiersError={identifiersError}
                {...{
                  displayName,
                  index,
                  roleOptions,
                  schema,
                  compKey: key,
                  initialCreatibutor: value,
                  removeCreatibutor: formikArrayRemove,
                  replaceCreatibutor: formikArrayReplace,
                  moveCreatibutor: formikArrayMove,
                  addLabel: modal.addLabel,
                  editLabel: modal.editLabel,
                  autocompleteNames: autocompleteNames,
                }}
              />
            );
          })}
          <CreatibutorsModal
            onCreatibutorChange={this.handleOnContributorChange}
            action="add"
            addLabel={modal.addLabel}
            editLabel={modal.editLabel}
            roleOptions={sortOptions(roleOptions)}
            schema={schema}
            autocompleteNames={autocompleteNames}
            trigger={
              <Button type="button" icon labelPosition="left">
                <Icon name="add" />
                {addButtonLabel}
              </Button>
            }
            showRole={showRole}
            showPersonSearch={showPersonSearch}
          />
          {creatibutorsError && typeof creatibutorsError == "string" && (
            <Label pointing="left" prompt>
              {creatibutorsError}
            </Label>
          )}
        </List>
      </Form.Field>
    );
  }
}

export class CreatibutorsField extends Component {
  render() {
    const { fieldPath } = this.props;

    return (
      <FieldArray
        name={fieldPath}
        component={(formikProps) => (
          <CreatibutorsFieldForm {...formikProps} {...this.props} />
        )}
      />
    );
  }
}

CreatibutorsFieldForm.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  addButtonLabel: PropTypes.string,
  modal: PropTypes.shape({
    addLabel: PropTypes.string.isRequired,
    editLabel: PropTypes.string.isRequired,
  }),
  schema: PropTypes.oneOf(["creators", "contributors"]).isRequired,
  autocompleteNames: PropTypes.oneOf(["search", "search_only", "off"]),
  label: PropTypes.string,
  labelIcon: PropTypes.string,
  roleOptions: PropTypes.array.isRequired,
  form: PropTypes.object.isRequired,
  remove: PropTypes.func.isRequired,
  replace: PropTypes.func.isRequired,
  move: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  showRole: PropTypes.bool,
  showPersonSearch: PropTypes.bool,
};

CreatibutorsFieldForm.defaultProps = {
  autocompleteNames: "search",
  label: i18next.t("Creators"),
  labelIcon: "user",
  modal: {
    addLabel: i18next.t("Add creator"),
    editLabel: i18next.t("Edit creator"),
  },
  addButtonLabel: i18next.t("Add creator"),
};

CreatibutorsField.propTypes = {
  fieldPath: PropTypes.string.isRequired,
  addButtonLabel: PropTypes.string,
  modal: PropTypes.shape({
    addLabel: PropTypes.string.isRequired,
    editLabel: PropTypes.string.isRequired,
  }),
  schema: PropTypes.oneOf(["creators", "contributors"]).isRequired,
  autocompleteNames: PropTypes.oneOf(["search", "search_only", "off"]),
  label: PropTypes.string,
  labelIcon: PropTypes.string,
  roleOptions: PropTypes.array,
  showRole: PropTypes.bool,
  showPersonSearch: PropTypes.bool,
};

CreatibutorsField.defaultProps = {
  autocompleteNames: "search",
  label: undefined,
  labelIcon: undefined,
  roleOptions: undefined,
  modal: {
    addLabel: i18next.t("Add creator"),
    editLabel: i18next.t("Edit creator"),
  },
  addButtonLabel: i18next.t("Add creator"),
};
