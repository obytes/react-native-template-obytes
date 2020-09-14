package com.obytes;

import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.zoontek.rnbootsplash.RNBootSplash;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "Obytes";
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    RNBootSplash.init(this, R.style.AppTheme); // <- display the generated bootsplash.xml drawable over our MainActivity
    super.onCreate(savedInstanceState);
  }
}
