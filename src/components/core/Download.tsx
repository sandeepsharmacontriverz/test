'use client'
import React from 'react';
import XLSX from 'xlsx';

export type FileDownloadProps = {
  fileLink: string;
  fileName: string;
  fileType: string;
};

export const handleDownload = async (fileLink: string, fileName: string, fileType: string) => {
  try {
    if (fileType === ".zip") {
      setTimeout(() => {
        window.open(fileLink)
      }, 700)
    }
    else {
      const response = await fetch(fileLink);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.${fileType}`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }
  catch (error) {
    console.error('Error downloading the file:', error);
  }
};



