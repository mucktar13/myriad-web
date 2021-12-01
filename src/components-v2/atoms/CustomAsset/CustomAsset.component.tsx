import React, {useState} from 'react';

import {Button, FormControl, InputLabel, OutlinedInput} from '@material-ui/core';

import {Modal} from '../Modal';
import {Props, Asset} from './customAsset.interface';
import {useStyles} from './customAsset.style';

export const CustomAsset: React.FC<Props> = props => {
  const {open, onClose} = props;
  const style = useStyles();
  const [newAsset, setNewAsset] = useState<Partial<Asset>>();

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewAsset(prevAsset => ({
      ...prevAsset,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = () => {
    // code
  };

  return (
    <Modal title="Custom asset" onClose={onClose} open={open}>
      <div className={style.root}>
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="rpc-address">RPC Address</InputLabel>
          <OutlinedInput
            id="rpc-address"
            placeholder="wss://rpc.myriad.systems"
            value={newAsset?.rpcAddress}
            onChange={handleChange('rpcAddress')}
            labelWidth={110}
          />
        </FormControl>
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="unit-code">Unit Code</InputLabel>
          <OutlinedInput
            id="unit-code"
            placeholder="Myriad"
            value={newAsset?.unitCode}
            onChange={handleChange('unitCode')}
            labelWidth={110}
          />
        </FormControl>
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="prefix-address">Prefix Address</InputLabel>
          <OutlinedInput
            id="prefix-address"
            placeholder="42"
            value={newAsset?.prefixAddress}
            onChange={handleChange('prefixAddress')}
            labelWidth={110}
            type="number"
          />
        </FormControl>
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="prefix-decimal">Prefix Decimal</InputLabel>
          <OutlinedInput
            id="prefix-decimal"
            placeholder="12"
            value={newAsset?.prefixDecimal}
            onChange={handleChange('prefixDecimal')}
            labelWidth={110}
            type="number"
          />
        </FormControl>
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="custom-type">Custom Type</InputLabel>
          <OutlinedInput
            id="custom-type"
            placeholder="JSON"
            onChange={handleChange('prefixDecimal')}
            labelWidth={110}
            multiline
            rows={4}
          />
        </FormControl>
        <Button
          onClick={handleSubmit}
          className={style.button}
          fullWidth
          variant="contained"
          color="primary">
          Add to my wallet
        </Button>
      </div>
    </Modal>
  );
};
