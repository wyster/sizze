<?php

namespace frontend\controllers;

use Yii;
use yii\web\Controller;
use frontend\models\Img;
use frontend\models\Category;
use frontend\models\Html;
use common\models\Font;
use frontend\models\HtmlList;

class ImgController extends Controller
{
    public $enableCsrfValidation = false;

    /**
     * Получение изображений
     */
    public function actionIndex()
    {
        if (Yii::$app->request->isAjax) {
            $imgs = Img::findImgByCategory(
                (int) Yii::$app->request->post('id_category'),
                (int) Yii::$app->request->post('pivot')
            );

            foreach ($imgs as &$img) {
                if (Img::templateHasList($img['id'])) {
                    $img['hasList'] = 1;
                    continue;
                }
                $img['hasList'] = 0;
            }

            echo json_encode($imgs);
        }
    }

    /**
     * Получение категорий изображений
     */
    public function actionCategory()
    {
        if (Yii::$app->request->isAjax) {
            echo json_encode(Category::get());
        }
    }

    /**
     * Контроллер для получения html
     */
    public function actionHtml()
    {
        if (Yii::$app->request->isAjax) {
            $img = Img::getById((int) Yii::$app->request->get('id'));
            $html = Html::getById($img->id_html);
            echo json_encode($html->content);
            die;
        }
    }

    /**
     * Получение html list
     */
    public function actionList()
    {
        if (Yii::$app->request->isAjax) {
            $htmlList = HtmlList::getIds((int) Yii::$app->request->get('id'));

            foreach ($htmlList as &$list) {
                $list['src'] = Img::getById($list['node'])->src;
            }

            echo json_encode($htmlList);
            die;
        }
    }

    /**
     * Загрузка шрифтов
     */
    public function actionFont()
    {
        if (Yii::$app->request->isAjax) {
            $pivot = Yii::$app->request->get('pivot');
            echo json_encode(Font::getPopular($pivot));
        }
    }

    function download_file($file, $name)
    {
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename=' . $name);
        exit(readfile($file));
    }

    public function actionPdf()
    {
        try {
            // create the API client instance
            $client = new \Pdfcrowd\HtmlToPdfClient("colortest", "ef0c5cf8db1f171effa15f024e3da830");

            $fileName = 'uploads/pdf/' . Yii::$app->security->generateRandomString(16) . '.pdf';

            $client-> setPageWidth(Yii::$app->request->post('width') / 1.1 . 'px');
            $client-> setPageHeight(Yii::$app->request->post('height') . 'px');


            // run the conversion and write the result to a file
            $client->convertStringToFile(Yii::$app->request->post('html'), $fileName);

            echo $fileName;
        } catch (\Pdfcrowd\Error $why) {
            // report the error
            error_log("Pdfcrowd Error: {$why}\n");

            // rethrow or handle the exception
            throw $why;
        }
    }

    public function actionPng()
    {
        try {
            // create the API client instance
            $client = new \Pdfcrowd\HtmlToImageClient("colortest", "ef0c5cf8db1f171effa15f024e3da830");

            $fileName = 'uploads/png/' . Yii::$app->security->generateRandomString(16) . '.png';

            // configure the conversion
            $client->setOutputFormat("png");

            // run the conversion and write the result to a file
            $client->convertStringToFile(Yii::$app->request->post('html'), $fileName);
        
            echo $fileName;
        } catch (\Pdfcrowd\Error $why) {
            // report the error
            error_log("Pdfcrowd Error: {$why}\n");

            // rethrow or handle the exception
            throw $why;
        }
    }

    public function actionJpeg()
    {
        try {
            // create the API client instance
            $client = new \Pdfcrowd\HtmlToImageClient("colortest", "ef0c5cf8db1f171effa15f024e3da830");

            $fileName = 'uploads/jpg/' . Yii::$app->security->generateRandomString(16) . '.jpg';

            // configure the conversion
            $client->setOutputFormat("jpg");

            // run the conversion and write the result to a file
            $client->convertStringToFile(Yii::$app->request->post('html'), $fileName);
        
            echo $fileName;
        } catch (\Pdfcrowd\Error $why) {
            // report the error
            error_log("Pdfcrowd Error: {$why}\n");

            // rethrow or handle the exception
            throw $why;
        }
    }
};
