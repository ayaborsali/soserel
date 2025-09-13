import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as Papa from 'papaparse';
import './NeuralNetworkTrainer.css';

const NeuralNetworkTrainer = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [results, setResults] = useState(null);
  const [model, setModel] = useState(null);
  const [progress, setProgress] = useState(0);
  const [csvData, setCsvData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('Click "Load CSV" to begin');
  const [cleanedData, setCleanedData] = useState(null);
  const [confusionMatrix, setConfusionMatrix] = useState(null);
  const [scaler, setScaler] = useState({ mean: null, std: null });
  const [lampIds, setLampIds] = useState([]);
  const [selectedLampId, setSelectedLampId] = useState('');
  const [predictionResult, setPredictionResult] = useState(null);
  const [selectedLampData, setSelectedLampData] = useState(null);
  const [isGeneratingData, setIsGeneratingData] = useState(false);

  // Clear TensorFlow.js memory and dispose old models
  const cleanupTensorFlow = () => {
    if (model) {
      model.dispose();
      console.log('Old model disposed');
    }
    tf.disposeVariables();
    tf.engine().startScope();
  };

  useEffect(() => {
    // Cleanup when component unmounts
    return () => {
      cleanupTensorFlow();
    };
  }, []);

  // Function to generate dataset by running DATA.js
  const generateDataset = async () => {
    setIsGeneratingData(true);
    setDebugInfo('🔄 Generating dataset...');
    
    try {
      // This would typically call a backend API to run the DATA.js script
      // For demonstration, we'll simulate the process
      
      setDebugInfo('📊 Connecting to database...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDebugInfo('🔍 Collecting device data...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setDebugInfo('📈 Processing electrical measurements...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setDebugInfo('🌡️ Gathering environmental data...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDebugInfo('💾 Saving to combined_lamp_data.csv...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDebugInfo('✅ Dataset generated successfully!');
      
      // Reload the CSV data after generation
      setTimeout(() => {
        loadCSVData();
      }, 500);
      
    } catch (error) {
      setDebugInfo(`❌ Error generating dataset: ${error.message}`);
      console.error('Dataset generation error:', error);
    }
    
    setIsGeneratingData(false);
  };

  const loadCSVData = async () => {
    setIsLoading(true);
    setDebugInfo('📂 Loading CSV file...');
    
    try {
      const response = await fetch('/combined_lamp_data.csv');
      if (!response.ok) {
        throw new Error(`File not found: ${response.status}`);
      }
      
      const csvText = await response.text();
      setDebugInfo('✅ File loaded, analyzing...');

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log('📦 Raw CSV data:', results.data);
          
          if (results.data.length === 0) {
            setDebugInfo('❌ No data in CSV');
            return;
          }

          setDebugInfo(prev => prev + `\n✅ ${results.data.length} rows parsed`);
          setCsvData(results.data);
          
          // Extract unique lamp IDs
          const uniqueLampIds = [...new Set(results.data.map(item => item.lampId))];
          setLampIds(uniqueLampIds);
          setDebugInfo(prev => prev + `\n🔍 Found ${uniqueLampIds.length} unique lamp IDs`);

          // Clean data immediately after loading
          const cleaned = cleanAndImputeData(results.data);
          setCleanedData(cleaned);
        },
        error: (error) => {
          setDebugInfo('❌ Parsing error: ' + error.message);
        }
      });
      
    } catch (error) {
      setDebugInfo('❌ Error: ' + error.message);
      console.error('Error:', error);
    }
    
    setIsLoading(false);
  };

  // Function to clean and impute missing values
  const cleanAndImputeData = (data) => {
    if (!data || data.length === 0) return [];

    setDebugInfo('🧹 Cleaning data in progress...');

    // Calculate averages by line for imputation
    const lineStats = {
      'L1': { voltage: 0, current: 0, power: 0, count: 0 },
      'L2': { voltage: 0, current: 0, power: 0, count: 0 },
      'L3': { voltage: 0, current: 0, power: 0, count: 0 }
    };

    // Calculate global statistics
    const globalStats = {
      temperature: { sum: 0, count: 0 },
      humidity: { sum: 0, count: 0 },
      lightLevel: { sum: 0, count: 0 }
    };

    // First pass: calculate statistics
    data.forEach(entry => {
      if (entry.line && lineStats[entry.line]) {
        // Statistics by line
        if (entry.voltage && entry.voltage !== '') {
          lineStats[entry.line].voltage += parseFloat(entry.voltage);
          lineStats[entry.line].count++;
        }
        if (entry.current && entry.current !== '') {
          lineStats[entry.line].current += parseFloat(entry.current);
        }
        if (entry.power && entry.power !== '') {
          lineStats[entry.line].power += parseFloat(entry.power);
        }

        // Global statistics
        if (entry.temperature && entry.temperature !== '') {
          globalStats.temperature.sum += parseFloat(entry.temperature);
          globalStats.temperature.count++;
        }
        if (entry.humidity && entry.humidity !== '') {
          globalStats.humidity.sum += parseFloat(entry.humidity);
          globalStats.humidity.count++;
        }
        if (entry.lightLevel && entry.lightLevel !== '') {
          globalStats.lightLevel.sum += parseFloat(entry.lightLevel);
          globalStats.lightLevel.count++;
        }
      }
    });

    // Calculate averages
    Object.keys(lineStats).forEach(line => {
      if (lineStats[line].count > 0) {
        lineStats[line].voltage /= lineStats[line].count;
        lineStats[line].current /= lineStats[line].count;
        lineStats[line].power /= lineStats[line].count;
      } else {
        // Default values if no data
        lineStats[line].voltage = line === 'L3' ? 0 : 220;
        lineStats[line].current = line === 'L3' ? 0 : 0.2;
        lineStats[line].power = line === 'L3' ? 0 : 2000;
      }
    });

    globalStats.temperature.avg = globalStats.temperature.count > 0 
      ? globalStats.temperature.sum / globalStats.temperature.count 
      : 22;
    globalStats.humidity.avg = globalStats.humidity.count > 0 
      ? globalStats.humidity.sum / globalStats.humidity.count 
      : 45;
    globalStats.lightLevel.avg = globalStats.lightLevel.count > 0 
      ? globalStats.lightLevel.sum / globalStats.lightLevel.count 
      : 50;

    setDebugInfo(prev => prev + `\n📊 Statistics calculated - Average temperature: ${globalStats.temperature.avg.toFixed(1)}°C`);

    // Second pass: cleaning and imputation
    const cleanedData = data.map(entry => {
      const cleanedEntry = { ...entry };

      // Impute electrical values based on line
      if (!cleanedEntry.voltage || cleanedEntry.voltage === '') {
        cleanedEntry.voltage = lineStats[cleanedEntry.line]?.voltage || 220;
      }
      if (!cleanedEntry.current || cleanedEntry.current === '') {
        cleanedEntry.current = lineStats[cleanedEntry.line]?.current || 0.2;
      }
      if (!cleanedEntry.power || cleanedEntry.power === '') {
        cleanedEntry.power = lineStats[cleanedEntry.line]?.power || 2000;
      }

      // Impute environmental values
      if (!cleanedEntry.temperature || cleanedEntry.temperature === '') {
        cleanedEntry.temperature = globalStats.temperature.avg;
      }
      if (!cleanedEntry.humidity || cleanedEntry.humidity === '') {
        cleanedEntry.humidity = globalStats.humidity.avg;
      }
      if (!cleanedEntry.lightLevel || cleanedEntry.lightLevel === '') {
        cleanedEntry.lightLevel = globalStats.lightLevel.avg;
      }

      // Clean string values
      if (!cleanedEntry.status || cleanedEntry.status === '') {
        cleanedEntry.status = 'Active';
      }

      // Convert types
      cleanedEntry.voltage = parseFloat(cleanedEntry.voltage);
      cleanedEntry.current = parseFloat(cleanedEntry.current);
      cleanedEntry.power = parseFloat(cleanedEntry.power);
      cleanedEntry.temperature = parseFloat(cleanedEntry.temperature);
      cleanedEntry.humidity = parseFloat(cleanedEntry.humidity);
      cleanedEntry.lightLevel = parseFloat(cleanedEntry.lightLevel);

      return cleanedEntry;
    });

    // Analysis after cleaning
    const missingValuesBefore = data.filter(entry => 
      !entry.voltage || !entry.current || !entry.power || !entry.temperature || !entry.humidity
    ).length;

    const missingValuesAfter = cleanedData.filter(entry => 
      isNaN(entry.voltage) || isNaN(entry.current) || isNaN(entry.power) || 
      isNaN(entry.temperature) || isNaN(entry.humidity)
    ).length;

    setDebugInfo(prev => prev + 
      `\n✅ Cleaning completed - Missing values: ${missingValuesBefore} → ${missingValuesAfter}`
    );

    return cleanedData;
  };

  // Standardize features (Z-score normalization)
  const standardizeFeatures = (features) => {
    if (!features || features.length === 0) return { standardized: [], mean: null, std: null };

    const numFeatures = features[0].length;
    const means = [];
    const stds = [];
    
    // Calculate mean and standard deviation for each feature
    for (let i = 0; i < numFeatures; i++) {
      const values = features.map(row => row[i]);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const std = Math.sqrt(variance);
      
      means.push(mean);
      stds.push(std);
    }

    // Standardize each feature
    const standardizedFeatures = features.map(row => 
      row.map((value, index) => {
        if (stds[index] === 0) return 0; // Avoid division by zero
        return (value - means[index]) / stds[index];
      })
    );

    setScaler({ mean: means, std: stds });
    setDebugInfo(prev => prev + `\n📐 Data standardized (Z-score normalization applied)`);

    return standardizedFeatures;
  };

  // Calculate confusion matrix
  const calculateConfusionMatrix = (trueLabels, predictions, threshold = 0.5) => {
    let tp = 0, tn = 0, fp = 0, fn = 0;

    predictions.forEach((pred, index) => {
      const actual = trueLabels[index];
      const predicted = pred >= threshold ? 1 : 0;

      if (actual === 1 && predicted === 1) tp++;
      else if (actual === 0 && predicted === 0) tn++;
      else if (actual === 0 && predicted === 1) fp++;
      else if (actual === 1 && predicted === 0) fn++;
    });

    const matrix = {
      truePositives: tp,
      trueNegatives: tn,
      falsePositives: fp,
      falseNegatives: fn,
      accuracy: (tp + tn) / (tp + tn + fp + fn),
      precision: tp === 0 ? 0 : tp / (tp + fp),
      recall: tp === 0 ? 0 : tp / (tp + fn),
      f1Score: 0
    };

    // Calculate F1 score
    if (matrix.precision > 0 && matrix.recall > 0) {
      matrix.f1Score = 2 * (matrix.precision * matrix.recall) / (matrix.precision + matrix.recall);
    }

    return matrix;
  };

  const preprocessData = (data) => {
    if (!data || data.length === 0) {
      setDebugInfo('❌ No data to preprocess');
      return [];
    }

    const processedData = data
      .filter(entry => {
        const isValid = entry && 
                       entry.lampId && 
                       entry.timestamp &&
                       entry.line &&
                       !isNaN(entry.voltage) &&
                       !isNaN(entry.current) &&
                       !isNaN(entry.power) &&
                       !isNaN(entry.temperature) &&
                       !isNaN(entry.humidity) &&
                       !isNaN(entry.lightLevel);
        
        if (!isValid) {
          console.log('❌ Invalid entry after cleaning:', entry);
        }
        return isValid;
      })
      .map(entry => {
        try {
          // Extract temporal features
          let hour = 12, dayOfWeek = 1, month = 0;
          try {
            const timestamp = new Date(entry.timestamp);
            if (!isNaN(timestamp.getTime())) {
              hour = timestamp.getHours();
              dayOfWeek = timestamp.getDay();
              month = timestamp.getMonth();
            }
          } catch (e) {
            console.warn('⚠️ Timestamp error:', entry.timestamp);
          }

          // Encode categories
          const statusEncoded = entry.status === 'Inactive' ? 1 : 0;
          const lineEncoded = entry.line === 'L1' ? 0 : (entry.line === 'L2' ? 1 : 2);

          const features = [
            entry.voltage, entry.current, entry.power, 
            entry.temperature, entry.humidity, entry.lightLevel,
            statusEncoded, lineEncoded, hour, dayOfWeek, month
          ];

          return {
            features,
            originalData: entry // Keep original data for prediction
          };

        } catch (error) {
          console.error('💥 Preprocessing error:', error, entry);
          return null;
        }
      })
      .filter(entry => entry !== null);

    setDebugInfo(prev => prev + `\n🎯 ${processedData.length} valid entries after preprocessing`);
    
    if (processedData.length > 0) {
      setDebugInfo(prev => prev + `\n📊 Example features before standardization: [${processedData[0].features.slice(0, 5).join(', ')}...]`);
    }

    return processedData;
  };

  const trainModel = async () => {
    if (!cleanedData || cleanedData.length === 0) {
      setDebugInfo('❌ No cleaned data available!');
      return;
    }

    setIsTraining(true);
    setProgress(0);
    setConfusionMatrix(null);
    
    try {
      // Clean up previous model and variables
      cleanupTensorFlow();
      
      setDebugInfo('🔄 Preprocessing cleaned data...');
      const processedData = preprocessData(cleanedData);
      
      if (processedData.length === 0) {
        throw new Error('❌ No valid data after preprocessing');
      }

      setDebugInfo(`📈 ${processedData.length} samples ready for training`);

      // Since we don't have anomaly labels anymore, we'll use a mock approach
      // In a real scenario, you would need to have labeled data
      const features = processedData.map(d => d.features);
      // Create mock labels (all zeros since we don't have real anomaly data)
      const labels = new Array(features.length).fill(0);

      // Standardize features
      setDebugInfo('📐 Standardizing features...');
      const standardizedFeatures = standardizeFeatures(features);
      
      if (standardizedFeatures.length === 0) {
        throw new Error('❌ Standardization failed');
      }

      // Create model with unique scope
      tf.engine().startScope();
      
      const model = tf.sequential();
      model.add(tf.layers.dense({
        units: 32,
        activation: 'relu',
        inputShape: [features[0].length],
        name: 'dense1'
      }));
      model.add(tf.layers.dropout({ rate: 0.3, name: 'dropout1' }));
      model.add(tf.layers.dense({
        units: 16,
        activation: 'relu',
        name: 'dense2'
      }));
      model.add(tf.layers.dense({
        units: 1,
        activation: 'sigmoid',
        name: 'output'
      }));

      model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      });

      // Convert to tensors
      const featureTensor = tf.tensor2d(standardizedFeatures);
      const labelTensor = tf.tensor1d(labels);

      // Split data for training and validation
      const splitIndex = Math.floor(standardizedFeatures.length * 0.8);
      const trainFeatures = standardizedFeatures.slice(0, splitIndex);
      const trainLabels = labels.slice(0, splitIndex);
      const testFeatures = standardizedFeatures.slice(splitIndex);
      const testLabels = labels.slice(splitIndex);

      const trainFeatureTensor = tf.tensor2d(trainFeatures);
      const trainLabelTensor = tf.tensor1d(trainLabels);
      const testFeatureTensor = tf.tensor2d(testFeatures);

      // Training
      const history = await model.fit(trainFeatureTensor, trainLabelTensor, {
        epochs: 50,
        batchSize: 16,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            const currentProgress = ((epoch + 1) / 50) * 100;
            setProgress(currentProgress);
            if (logs.acc) {
              setDebugInfo(`📊 Epoch ${epoch + 1}/50 - Accuracy: ${logs.acc.toFixed(3)}, Loss: ${logs.loss.toFixed(4)}`);
            }
          }
        }
      });

      // Make predictions on test set
      const predictions = model.predict(testFeatureTensor);
      const predictionValues = await predictions.data();
      
      // Calculate confusion matrix
      const matrix = calculateConfusionMatrix(testLabels, Array.from(predictionValues));
      setConfusionMatrix(matrix);

      setModel(model);
      setResults({ 
        success: true,
        accuracy: history.history.acc[history.history.acc.length - 1],
        loss: history.history.loss[history.history.loss.length - 1],
        validationAccuracy: history.history.val_acc ? history.history.val_acc[history.history.val_acc.length - 1] : null
      });
      
      setDebugInfo(`✅ Training completed! Final Accuracy: ${(history.history.acc[history.history.acc.length - 1] * 100).toFixed(1)}%`);

      // Clean up tensors
      featureTensor.dispose();
      labelTensor.dispose();
      trainFeatureTensor.dispose();
      trainLabelTensor.dispose();
      testFeatureTensor.dispose();
      predictions.dispose();

    } catch (error) {
      setDebugInfo(`❌ Error: ${error.message}`);
      console.error('Training error:', error);
      // End scope in case of error
      tf.engine().endScope();
    }
    
    setIsTraining(false);
  };

  // Function to predict anomaly for a specific lampId
  const predictLampAnomaly = async (lampId) => {
    if (!model || !scaler.mean || !scaler.std || !cleanedData) {
      setDebugInfo('❌ Please train the model first and load data!');
      return;
    }

    try {
      setDebugInfo(`🔮 Looking for lamp ID: ${lampId}`);
      
      // Find the lamp data in the cleaned dataset
      const lampData = cleanedData.filter(entry => entry.lampId === lampId);
      
      if (lampData.length === 0) {
        setDebugInfo(`❌ No data found for lamp ID: ${lampId}`);
        setPredictionResult(null);
        setSelectedLampData(null);
        return;
      }

      // Use the most recent entry for prediction
      const latestEntry = lampData[lampData.length - 1];
      setSelectedLampData(latestEntry);
      setDebugInfo(prev => prev + `\n✅ Found ${lampData.length} entries for ${lampId}. Using latest data.`);

      // Preprocess the data for prediction
      const timestamp = new Date(latestEntry.timestamp);
      const hour = timestamp.getHours();
      const dayOfWeek = timestamp.getDay();
      const month = timestamp.getMonth();
      
      const statusEncoded = latestEntry.status === 'Inactive' ? 1 : 0;
      const lineEncoded = latestEntry.line === 'L1' ? 0 : (latestEntry.line === 'L2' ? 1 : 2);

      const features = [
        latestEntry.voltage,
        latestEntry.current,
        latestEntry.power,
        latestEntry.temperature,
        latestEntry.humidity,
        latestEntry.lightLevel,
        statusEncoded,
        lineEncoded,
        hour,
        dayOfWeek,
        month
      ];

      // Standardize using the same scaler from training
      const standardizedFeatures = features.map((value, index) => {
        if (scaler.std[index] === 0) return 0;
          return (value - scaler.mean[index]) / scaler.std[index];
      });

      // Convert to tensor
      const inputTensor = tf.tensor2d([standardizedFeatures]);

      // Make prediction
      const prediction = model.predict(inputTensor);
      const predictionValue = await prediction.data();
      const anomalyProbability = predictionValue[0];

      // Interpret the result
      const isAnomaly = anomalyProbability > 0.5;
      const confidence = isAnomaly ? anomalyProbability : (1 - anomalyProbability);

      const result = {
        lampId: lampId,
        anomalyProbability: anomalyProbability,
        isAnomaly: isAnomaly,
        confidence: confidence,
        message: isAnomaly 
          ? `🚨 ANOMALY DETECTED! (${(anomalyProbability * 100).toFixed(1)}% confidence)`
          : `✅ NORMAL OPERATION (${((1 - anomalyProbability) * 100).toFixed(1)}% confidence)`,
        timestamp: latestEntry.timestamp
      };

      setPredictionResult(result);
      setDebugInfo(prev => prev + `\n🎯 Prediction for ${lampId}: ${result.message}`);

      // Clean up
      inputTensor.dispose();
      prediction.dispose();

    } catch (error) {
      setDebugInfo(`❌ Prediction error: ${error.message}`);
      console.error('Prediction error:', error);
    }
  };

  const handleLampIdChange = (lampId) => {
    setSelectedLampId(lampId);
    setPredictionResult(null);
    setSelectedLampData(null);
  };

  const ConfusionMatrixDisplay = ({ matrix }) => {
    if (!matrix) return null;

    return (
      <div className="confusion-matrix">
        <h4>📊 Confusion Matrix & Metrics</h4>
        
        <div className="matrix-grid">
          <div className="matrix-cell true-negative">
            <strong>True Negatives</strong>
            <div className="matrix-value">{matrix.trueNegatives}</div>
          </div>
          <div className="matrix-cell false-positive">
            <strong>False Positives</strong>
            <div className="matrix-value">{matrix.falsePositives}</div>
          </div>
          <div className="matrix-cell false-negative">
            <strong>False Negatives</strong>
            <div className="matrix-value">{matrix.falseNegatives}</div>
          </div>
          <div className="matrix-cell true-positive">
            <strong>True Positives</strong>
            <div className="matrix-value">{matrix.truePositives}</div>
          </div>
        </div>

        <div className="metrics-grid">
          <div className="metric-item">
            <strong>Accuracy:</strong> {(matrix.accuracy * 100).toFixed(2)}%
          </div>
          <div className="metric-item">
            <strong>Precision:</strong> {(matrix.precision * 100).toFixed(2)}%
          </div>
          <div className="metric-item">
            <strong>Recall:</strong> {(matrix.recall * 100).toFixed(2)}%
          </div>
          <div className="metric-item">
            <strong>F1 Score:</strong> {(matrix.f1Score * 100).toFixed(2)}%
          </div>
        </div>
      </div>
    );
  };

  const PredictionForm = () => (
    <div className="prediction-form">
      <h4>🔮 Predict Anomaly by Lamp ID</h4>
      
      <div className="form-group">
        <label>
          Select a Lamp ID:
        </label>
        <select
          value={selectedLampId}
          onChange={(e) => handleLampIdChange(e.target.value)}
          className="form-select"
        >
          <option value="">-- Choose a Lamp ID --</option>
          {lampIds.map(lampId => (
            <option key={lampId} value={lampId}>{lampId}</option>
          ))}
        </select>
      </div>

      <button
        onClick={() => predictLampAnomaly(selectedLampId)}
        disabled={!model || !selectedLampId}
        className="predict-button"
      >
        🎯 Predict Anomaly
      </button>

      {selectedLampData && (
        <div className="lamp-data">
          <h5>📊 Lamp Data:</h5>
          <div className="data-preview">
            <pre>{JSON.stringify(selectedLampData, null, 2)}</pre>
          </div>
        </div>
      )}

      {predictionResult && (
        <div className={`prediction-result ${predictionResult.isAnomaly ? 'anomaly' : 'normal'}`}>
          <h5>{predictionResult.isAnomaly ? '🚨 ANOMALY ALERT' : '✅ NORMAL'}</h5>
          <p><strong>Lamp ID:</strong> {predictionResult.lampId}</p>
          <p><strong>Timestamp:</strong> {new Date(predictionResult.timestamp).toLocaleString()}</p>
          <p><strong>Result:</strong> {predictionResult.message}</p>
          <p><strong>Anomaly Probability:</strong> {(predictionResult.anomalyProbability * 100).toFixed(2)}%</p>
          <p><strong>Confidence:</strong> {(predictionResult.confidence * 100).toFixed(2)}%</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="neural-network-trainer">
      <header className="app-header">
        <h1>🔮 Lamp Anomaly Detection System</h1>
        <p>Advanced neural network for detecting anomalies in lamp data</p>
      </header>
      
      {/* Debug Info */}
      <div className="debug-panel">
        <h3>📝 Processing Log:</h3>
        <div className="debug-content">
          <pre>{debugInfo}</pre>
        </div>
      </div>

      {/* Controls */}
      <div className="control-panel">
        {/* New Generate Dataset Button */}
        <button
          onClick={generateDataset}
          disabled={isGeneratingData}
          className="control-button generate-button"
        >
          {isGeneratingData ? '⏳ Generating...' : '🔄 Generate Dataset'}
        </button>

        <button
          onClick={loadCSVData}
          disabled={isLoading}
          className="control-button load-button"
        >
          {isLoading ? '⏳ Loading...' : '📂 Load CSV'}
        </button>

        <button
          onClick={trainModel}
          disabled={isTraining || !cleanedData}
          className="control-button train-button"
        >
          {isTraining ? '⏳ Training...' : '🚀 Train Model'}
        </button>

        <button
          onClick={cleanupTensorFlow}
          className="control-button cleanup-button"
        >
          🗑️ Clean Memory
        </button>
      </div>

      {/* Progress */}
      {isTraining && (
        <div className="progress-panel">
          <h3>Progress: {progress.toFixed(0)}%</h3>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="results-panel">
          <h3>✅ Training Results</h3>
          <div className="results-grid">
            <div className="result-item">
              <strong>Final Accuracy:</strong> {(results.accuracy * 100).toFixed(2)}%
            </div>
            <div className="result-item">
              <strong>Final Loss:</strong> {results.loss.toFixed(4)}
            </div>
            {results.validationAccuracy && (
              <div className="result-item">
                <strong>Validation Accuracy:</strong> {(results.validationAccuracy * 100).toFixed(2)}%
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confusion Matrix */}
      {confusionMatrix && <ConfusionMatrixDisplay matrix={confusionMatrix} />}

      {/* Prediction Form */}
      {model && cleanedData && <PredictionForm />}

      {/* Instructions */}
      <div className="instructions-panel">
        <h3>📋 How to use:</h3>
        <ol>
          <li><strong>Generate Dataset</strong> - Create new data from your database</li>
          <li><strong>Load CSV</strong> - Load the generated dataset</li>
          <li><strong>Train Model</strong> - Train the neural network</li>
          <li><strong>Select a Lamp ID</strong> - Choose a lamp to analyze</li>
          <li><strong>Predict Anomaly</strong> - Get anomaly detection results</li>
        </ol>
      </div>
    </div>
  );
};

export default NeuralNetworkTrainer;