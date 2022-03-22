import React, {useEffect, useState} from 'react';

import {OutlinedInput, FormHelperText} from '@material-ui/core';
import type {InputProps} from '@material-ui/core';

import {BN, BN_TEN, BN_ZERO, isBn} from '@polkadot/util';

import {useStyles} from './InputAmount.style';

type InputAmountProps = Omit<InputProps, 'onChange'> & {
  defaultValue?: string | BN;
  maxValue: BN | number;
  decimal: number;
  onChange?: (value?: BN) => void;
};

export const InputAmount: React.FC<InputAmountProps> = props => {
  const {maxValue, decimal, onChange, ...inputProps} = props;

  const styles = useStyles();

  const [value, setValue] = useState<string>();
  const [valid, setValid] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    setValue(undefined);
    setValid(true);
  }, [decimal]);

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    // remove invalid char
    const input = value.replace(/[^\d.]+$/, '');

    const amount = toBigNumber(input);
    const [valid, errorMessage] = isValidNumber(amount);

    setValue(input);
    setValid(valid);
    setError(errorMessage);

    onChange && onChange(amount);
  };

  const toBigNumber = (value: string) => {
    let result: BN;

    const isDecimalValue = value.match(/^(\d+)\.(\d+)$/);

    if (isDecimalValue) {
      const div = new BN(value.replace(/\.\d*$/, ''));
      const modString = value.replace(/^\d+\./, '').substr(0, decimal);
      const mod = new BN(modString);

      result = div
        .mul(BN_TEN.pow(new BN(decimal)))
        .add(mod.mul(BN_TEN.pow(new BN(decimal - modString.length))));
    } else {
      result = new BN(value).mul(BN_TEN.pow(new BN(decimal)));
    }

    return result;
  };

  const isValidNumber = (value: BN): [boolean, string?] => {
    const maxTip = isBn(maxValue) ? maxValue : toBigNumber(maxValue.toString());

    if (value.lte(BN_ZERO)) {
      return [false, 'Digit only'];
    }

    if (maxTip && maxTip.lten(0)) {
      return [false, 'Insufficient balance'];
    }

    if (maxTip && maxTip.gtn(0) && value.gt(maxTip)) {
      return [false, 'Insufficient balance'];
    }

    return [true];
  };

  return (
    <>
      <OutlinedInput
        id="input-amount"
        classes={{root: styles.input}}
        type="number"
        value={value?.toString()}
        error={!valid}
        onChange={handleAmountChange}
        onWheel={console.log}
        {...inputProps}
      />
      <FormHelperText style={{alignSelf: 'center'}}>{error}</FormHelperText>
    </>
  );
};