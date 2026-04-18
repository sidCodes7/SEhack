import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONTS } from '../../constants/typography';
import { SPACING } from '../../constants/spacing';

interface Stage {
  name: string;
  status: 'approved' | 'pending' | 'waiting' | 'rejected';
  date?: string;
  avgTime?: string;
}

interface ApprovalProgressBarProps {
  stages: Stage[];
}

export const ApprovalProgressBar: React.FC<ApprovalProgressBarProps> = ({ stages }) => {
  const getIconForStatus = (status: Stage['status']) => {
    switch (status) {
      case 'approved': return '✓';
      case 'pending': return '●';
      case 'rejected': return '✕';
      case 'waiting': return '○';
    }
  };

  const getColorForStatus = (status: Stage['status']) => {
    switch (status) {
      case 'approved': return '#45554F';
      case 'pending': return '#1A1A1A';
      case 'rejected': return '#A83836';
      case 'waiting': return '#B0B3AD';
    }
  };

  const getBgForStatus = (status: Stage['status']) => {
    switch (status) {
      case 'approved': return '#D5E7DE';
      case 'pending': return '#FFFFFF';
      case 'rejected': return '#F8E4E4';
      case 'waiting': return '#F4F4EF';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.lineContainer}>
        {stages.map((stage, index) => (
          <React.Fragment key={stage.name}>
            {/* Node */}
            <View style={styles.nodeColumn}>
              <View
                style={[
                  styles.node,
                  {
                    backgroundColor: getBgForStatus(stage.status),
                    borderColor: getColorForStatus(stage.status),
                    borderWidth: stage.status === 'pending' ? 3 : 0,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.nodeIcon,
                    { color: getColorForStatus(stage.status) },
                  ]}
                >
                  {getIconForStatus(stage.status)}
                </Text>
              </View>
              <Text style={styles.stageName}>{stage.name}</Text>
              <Text style={[styles.stageStatus, { color: getColorForStatus(stage.status) }]}>
                {stage.status === 'approved' ? 'Approved' :
                 stage.status === 'pending' ? 'Pending' :
                 stage.status === 'rejected' ? 'Rejected' : 'Waiting'}
              </Text>
              {stage.date && <Text style={styles.stageDate}>{stage.date}</Text>}
              {stage.avgTime && <Text style={styles.stageDate}>{stage.avgTime}</Text>}
            </View>
            {/* Connector line */}
            {index < stages.length - 1 && (
              <View
                style={[
                  styles.connector,
                  {
                    backgroundColor:
                      stage.status === 'approved' ? '#45554F' : '#E1E3DD',
                  },
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  nodeColumn: {
    alignItems: 'center',
    width: 80,
  },
  node: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nodeIcon: {
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  connector: {
    height: 3,
    flex: 1,
    alignSelf: 'center',
    marginTop: 20,
    borderRadius: 2,
  },
  stageName: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#1A1A1A',
    marginTop: 8,
    textAlign: 'center',
  },
  stageStatus: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  stageDate: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: '#6B6B6B',
    marginTop: 2,
    textAlign: 'center',
  },
});
