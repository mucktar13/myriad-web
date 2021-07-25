import React from 'react';

import {NextPage} from 'next';
import Head from 'next/head';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import {createStyles, makeStyles, Theme} from '@material-ui/core/styles';

import Layout from '../src/components/Layout/Layout.container';

type ErrorProps = {
  statusCode: number;
};
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      marginTop: theme.spacing(5),
    },
  }),
);

const CustomError: NextPage<ErrorProps> = () => {
  const style = useStyles();

  return (
    <>
      <Head>
        <title>{`The page you were looking for doesn't exist`}</title>
      </Head>
      <Layout>
        <Grid style={{textAlign: 'center'}} className={style.root} container justify="center">
          <div>
            <Typography variant="h3" component="h1" display="block">
              The page you were looking doesn&apos;t exist.
            </Typography>
            <Typography variant="h4" component="h2" display="block">
              Try searching for another.
            </Typography>
          </div>
        </Grid>
      </Layout>
    </>
  );
};

export default CustomError;
