package com.example.vision

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

class ExampleUnitTest {
    @Test
    fun addition_isCorrect() {
        assertEquals(4, 2 + 2)
    }

    @Test
    fun verifyAssetsExist() {
        val assetsDir = if (File("src/main/assets").exists()) {
            File("src/main/assets")
        } else {
            File("app/src/main/assets")
        }
        assertTrue("Assets directory should exist", assetsDir.exists() && assetsDir.isDirectory)
        val indexHtml = File(assetsDir, "index.html")
        assertTrue("index.html should exist in assets", indexHtml.exists())
    }
}
